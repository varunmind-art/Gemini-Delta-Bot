import { EventEmitter } from 'events';
import cron from 'node-cron';
import { Trade, TradeStatus, TradeType, BotConfig } from '../../../types';
import { DeltaExchangeService } from './DeltaExchangeService';
import { DEFAULT_CONFIG } from '../../../constants';

export class TradingEngine extends EventEmitter {
  private config: BotConfig;
  private trades: Trade[] = [];
  private isRunning: boolean = false;
  private deltaService: DeltaExchangeService;
  private activeOrders: Map<string, any> = new Map();

  constructor(deltaService: DeltaExchangeService) {
    super();
    this.deltaService = deltaService;
    this.config = DEFAULT_CONFIG;
    this.loadState();
  }

  // Core Trading Methods
  async placeInitialTrades(): Promise<void> {
    if (!this.isRunning) return;

    const now = new Date();
    const isThursday = now.getUTCDay() === 4;
    
    if (isThursday && this.config.noTradeOnThursday) {
      this.emitUpdate({ type: 'LOG', data: 'No trading on Thursdays' });
      return;
    }

    try {
      // Get tomorrow's expiry date (format: YYYY-MM-DD)
      const expiry = this.getNextExpiry();
      
      // Place CALL trade
      await this.placeOptionTrade(TradeType.CALL, expiry);
      
      // Place PUT trade  
      await this.placeOptionTrade(TradeType.PUT, expiry);

    } catch (error) {
      this.emitUpdate({ 
        type: 'ERROR', 
        data: `Failed to place initial trades: ${error}` 
      });
    }
  }

  private async placeOptionTrade(tradeType: TradeType, expiry: string): Promise<void> {
    const strikePrice = await this.findSuitableStrike(tradeType, expiry);
    const product = await this.deltaService.getProductByStrike(
      strikePrice, 
      tradeType === TradeType.CALL, 
      expiry
    );

    if (!product) {
      throw new Error(`No product found for ${tradeType} at strike ${strikePrice}`);
    }

    // Place limit order
    const order = await this.deltaService.placeOrder(
      product.id,
      'sell',
      this.config.quantity,
      this.getPremiumPrice(),
      'limit'
    );

    // Monitor order fill
    this.monitorOrderFill(order.id, tradeType, product, strikePrice);
  }

  private async monitorOrderFill(orderId: string, tradeType: TradeType, product: any, strikePrice: number): Promise<void> {
    const checkInterval = setInterval(async () => {
      try {
        const order = await this.deltaService.getOrderStatus(orderId);
        
        if (order.status === 'filled') {
          clearInterval(checkInterval);
          await this.onOrderFilled(order, tradeType, product, strikePrice);
        } else if (order.status === 'cancelled') {
          clearInterval(checkInterval);
          // Convert to market order after 15 seconds if not filled
          setTimeout(() => this.placeMarketOrder(tradeType, product), 15000);
        }
      } catch (error) {
        console.error('Error monitoring order:', error);
      }
    }, 1000);
  }

  private async onOrderFilled(order: any, tradeType: TradeType, product: any, strikePrice: number): Promise<void> {
    const entryPrice = parseFloat(order.average_price);
    const trade: Trade = {
      id: order.id,
      type: tradeType,
      status: TradeStatus.ACTIVE,
      strikePrice,
      entryTime: new Date().toISOString(),
      entryPrice,
      stopLossPrice: this.calculateStopLoss(entryPrice),
      takeProfitPrice: this.calculateTakeProfit(entryPrice),
      currentPrice: entryPrice,
      pnl: 0,
      quantity: this.config.quantity
    };

    this.trades.push(trade);
    this.saveState();
    
    // Place bracket orders (SL and TP)
    await this.placeBracketOrders(trade, product);
    
    this.emitUpdate({ type: 'TRADE_OPENED', data: trade });
  }

  private async placeBracketOrders(trade: Trade, product: any): Promise<void> {
    // Place Stop Loss order
    const slOrder = await this.deltaService.placeOrder(
      product.id,
      'buy',
      trade.quantity,
      trade.stopLossPrice,
      'limit'
    );

    // Place Take Profit order  
    const tpOrder = await this.deltaService.placeOrder(
      product.id,
      'buy', 
      trade.quantity,
      trade.takeProfitPrice,
      'limit'
    );

    this.activeOrders.set(`${trade.id}-sl`, slOrder);
    this.activeOrders.set(`${trade.id}-tp`, tpOrder);
  }

  // Price Monitoring and Management
  async monitorPrices(): Promise<void> {
    for (const trade of this.getActiveTrades()) {
      try {
        const product = await this.findProductForTrade(trade);
        const currentPrice = await this.deltaService.getMarketPrice(product.id);
        
        // Update trade with current price
        trade.currentPrice = currentPrice;
        trade.pnl = (trade.entryPrice - currentPrice) * trade.quantity;
        
        // Check if we need to adjust SL for remaining leg
        await this.checkForSLAdjustment(trade);
        
      } catch (error) {
        console.error(`Error monitoring trade ${trade.id}:`, error);
      }
    }
    
    this.emitUpdate({ type: 'PRICE_UPDATE', data: this.trades });
  }

  private async checkForSLAdjustment(trade: Trade): Promise<void> {
    const activeTrades = this.getActiveTrades();
    
    // If one leg is closed and other is still active, move SL to entry
    if (activeTrades.length === 1) {
      const remainingTrade = activeTrades[0];
      if (remainingTrade.stopLossPrice !== remainingTrade.entryPrice) {
        remainingTrade.stopLossPrice = remainingTrade.entryPrice;
        
        // Update SL order on exchange
        await this.updateStopLossOrder(remainingTrade);
        
        this.emitUpdate({ 
          type: 'LOG', 
          data: `Moved SL to entry for ${remainingTrade.type} trade` 
        });
      }
    }
  }

  // Re-entry Logic
  async handleReEntry(closedTrade: Trade): Promise<void> {
    const now = new Date();
    const cutoffHour = this.config.reentryCutoffHour;
    
    if (now.getUTCHours() >= cutoffHour) {
      this.emitUpdate({ 
        type: 'LOG', 
        data: 'Re-entry cutoff time reached. No re-entry.' 
      });
      return;
    }

    this.emitUpdate({ 
      type: 'LOG', 
      data: `Looking for re-entry for ${closedTrade.type}...` 
    });

    // Wait before re-entry (simulate finding new strike)
    setTimeout(async () => {
      try {
        const expiry = this.getNextExpiry();
        await this.placeOptionTrade(closedTrade.type, expiry);
      } catch (error) {
        this.emitUpdate({ 
          type: 'ERROR', 
          data: `Re-entry failed: ${error}` 
        });
      }
    }, 2000);
  }

  // EOD Square-off
  async squareOffAll(): Promise<void> {
    this.emitUpdate({ type: 'LOG', data: 'EOD Square-off initiated' });
    
    for (const trade of this.getActiveTrades()) {
      await this.squareOffTrade(trade, TradeStatus.CLOSED_EOD);
    }
  }

  async squareOffTrade(trade: Trade, status: TradeStatus): Promise<void> {
    try {
      const product = await this.findProductForTrade(trade);
      
      // Cancel existing bracket orders
      await this.cancelBracketOrders(trade);
      
      // Place market order to close position
      await this.deltaService.placeOrder(
        product.id,
        'buy',
        trade.quantity,
        0, // market order
        'market'
      );

      trade.status = status;
      trade.exitTime = new Date().toISOString();
      trade.exitPrice = trade.currentPrice;
      
      this.saveState();
      this.emitUpdate({ type: 'TRADE_CLOSED', data: trade });

      // Handle re-entry for SL/TP closures
      if (status === TradeStatus.CLOSED_SL || status === TradeStatus.CLOSED_TP) {
        await this.handleReEntry(trade);
      }

    } catch (error) {
      this.emitUpdate({ 
        type: 'ERROR', 
        data: `Failed to square off trade ${trade.id}: ${error}` 
      });
    }
  }

  // Utility Methods
  private calculateStopLoss(entryPrice: number): number {
    return entryPrice + (entryPrice * (this.config.stopLossPercentage / 100));
  }

  private calculateTakeProfit(entryPrice: number): number {
    return entryPrice - (entryPrice * (this.config.takeProfitPercentage / 100));
  }

  private getPremiumPrice(): number {
    const range = this.config.premiumMax - this.config.premiumMin;
    return this.config.premiumMin + (Math.random() * range);
  }

  private async findSuitableStrike(tradeType: TradeType, expiry: string): Promise<number> {
    // Implement logic to find strike price with suitable premium
    // This is a simplified version - you'd want more sophisticated logic
    const baseStrike = 50000;
    const randomOffset = Math.round(Math.random() * 5000);
    
    return tradeType === TradeType.CALL ? 
      baseStrike + randomOffset : 
      baseStrike - randomOffset;
  }

  private getNextExpiry(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private async findProductForTrade(trade: Trade): Promise<any> {
    const expiry = trade.entryTime.split('T')[0];
    return this.deltaService.getProductByStrike(
      trade.strikePrice,
      trade.type === TradeType.CALL,
      expiry
    );
  }

  // State Management
  private saveState(): void {
    // Implement state persistence (file, database, etc.)
    const state = {
      config: this.config,
      trades: this.trades
    };
    // Save to file or database
  }

  private loadState(): void {
    // Implement state loading
    // For now, start fresh
    this.trades = [];
  }

  // Public API
  start(): void {
    this.isRunning = true;
    
    // Set up cron jobs for trading schedule
    cron.schedule('35 21 * * *', () => this.placeInitialTrades()); // 21:35 IST
    cron.schedule('25 17 * * *', () => this.squareOffAll()); // 17:25 IST
    
    // Monitor prices every 5 seconds
    setInterval(() => this.monitorPrices(), 5000);
    
    this.emitUpdate({ type: 'BOT_STARTED' });
  }

  stop(): void {
    this.isRunning = false;
    this.emitUpdate({ type: 'BOT_STOPPED' });
  }

  getActiveTrades(): Trade[] {
    return this.trades.filter(t => t.status === TradeStatus.ACTIVE);
  }

  getAllTrades(): Trade[] {
    return this.trades;
  }

  getConfig(): BotConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<BotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveState();
    this.emitUpdate({ type: 'CONFIG_UPDATED', data: this.config });
  }

  private emitUpdate(data: any): void {
    this.emit('update', data);
  }

  onUpdate(callback: (data: any) => void): void {
    this.on('update', callback);
  }
}
