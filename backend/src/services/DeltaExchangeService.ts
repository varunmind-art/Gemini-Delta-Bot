import axios from 'axios';
import { WalletBalance } from '../../../types';

export interface DeltaOrder {
  id: string;
  product_id: number;
  limit_price: string;
  quantity: string;
  filled_quantity: string;
  order_type: 'limit' | 'market';
  side: 'buy' | 'sell';
  status: 'open' | 'filled' | 'cancelled';
}

export interface DeltaPosition {
  product_id: number;
  size: number;
  entry_price: string;
  mark_price: string;
}

export class DeltaExchangeService {
  private baseURL = 'https://api.delta.exchange';
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.DELTA_API_KEY!;
    this.apiSecret = process.env.DELTA_API_SECRET!;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Delta Exchange API credentials not configured');
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    const timestamp = Date.now().toString();
    const signature = await this.generateSignature(method, endpoint, timestamp, data);
    
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'api-key': this.apiKey,
        'timestamp': timestamp,
        'signature': signature,
        'Content-Type': 'application/json'
      },
      data
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error('Delta API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  private async generateSignature(method: string, endpoint: string, timestamp: string, data?: any): Promise<string> {
    // Implement HMAC-SHA256 signature generation
    const crypto = await import('crypto');
    const queryString = data ? JSON.stringify(data) : '';
    const payload = `${timestamp}${method}${endpoint}${queryString}`;
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
  }

  // Wallet Methods
  async getWalletBalance(): Promise<WalletBalance> {
    const response = await this.makeRequest('GET', '/wallet/balances');
    const usdtBalance = response.result.find((bal: any) => bal.asset_symbol === 'USDT');
    
    return {
      total: parseFloat(usdtBalance.balance),
      available: parseFloat(usdtBalance.available_balance),
      currency: 'USDT'
    };
  }

  // Trading Methods
  async placeOrder(productId: number, side: 'buy' | 'sell', quantity: number, price: number, orderType: 'limit' | 'market' = 'limit'): Promise<DeltaOrder> {
    const order = {
      product_id: productId,
      size: quantity,
      limit_price: price.toString(),
      order_type: orderType,
      side: side
    };

    return this.makeRequest('POST', '/orders', order);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.makeRequest('DELETE', `/orders/${orderId}`);
  }

  async getPositions(): Promise<DeltaPosition[]> {
    const response = await this.makeRequest('GET', '/positions');
    return response.result;
  }

  async getOrderStatus(orderId: string): Promise<DeltaOrder> {
    return this.makeRequest('GET', `/orders/${orderId}`);
  }

  // Product/Market Data
  async getProducts(): Promise<any[]> {
    const response = await this.makeRequest('GET', '/products');
    return response.result.filter((product: any) => 
      product.symbol.includes('BTC') && product.contract_type === 'options_contract'
    );
  }

  async getProductByStrike(strike: number, isCall: boolean, expiry: string): Promise<any> {
    const products = await this.getProducts();
    return products.find((product: any) => 
      product.strike === strike &&
      product.symbol.includes(isCall ? 'C' : 'P') &&
      product.expiry === expiry
    );
  }

  // Get current market price for a product
  async getMarketPrice(productId: number): Promise<number> {
    const response = await this.makeRequest('GET', `/tickers?product_ids=${productId}`);
    return parseFloat(response.result[0].mark_price);
  }
}
