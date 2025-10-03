
import { useState, useEffect, useCallback, useRef } from 'react';
import { Trade, TradeStatus, TradeType, BotConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

export const useTradingBot = () => {
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date(new Date().getTime() + IST_OFFSET));

  const tradesRef = useRef(trades);
  tradesRef.current = trades;

  const configRef = useRef(config);
  configRef.current = config;
  
  const addLog = useCallback((message: string) => {
    const now = new Date(new Date().getTime() + IST_OFFSET);
    const timestamp = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 100)]);
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    setTrades(prevTrades =>
      prevTrades.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const createNewTrade = useCallback((tradeType: TradeType, isReentry: boolean = false) => {
    const entryPrice = configRef.current.premiumMin + Math.random() * (configRef.current.premiumMax - configRef.current.premiumMin);
    const slPercentage = configRef.current.stopLossPercentage / 100;
    const tpPercentage = configRef.current.takeProfitPercentage / 100;

    const newTrade: Trade = {
      id: `${tradeType}-${Date.now()}`,
      type: tradeType,
      status: TradeStatus.ACTIVE,
      strikePrice: 50000 + Math.round(Math.random() * 5000) * (tradeType === TradeType.CALL ? 1 : -1),
      entryTime: new Date(new Date().getTime() + IST_OFFSET).toISOString(),
      entryPrice,
      stopLossPrice: entryPrice + entryPrice * slPercentage,
      takeProfitPrice: entryPrice - entryPrice * tpPercentage,
      currentPrice: entryPrice,
      pnl: 0,
      quantity: configRef.current.quantity,
    };
    setTrades(prev => [...prev, newTrade]);
    addLog(`${isReentry ? 'Re-entry' : 'Entry'}: New ${tradeType} trade opened. Premium: ${entryPrice.toFixed(2)}.`);
  }, [addLog]);

  const closeTrade = useCallback((id: string, status: TradeStatus, exitPrice: number) => {
    const trade = tradesRef.current.find(t => t.id === id);
    if (!trade || trade.status !== TradeStatus.ACTIVE) return;

    const pnl = (trade.entryPrice - exitPrice) * trade.quantity;
    updateTrade(id, {
      status,
      exitPrice,
      pnl,
      exitTime: new Date(new Date().getTime() + IST_OFFSET).toISOString(),
    });
    addLog(`Closed ${trade.type} #${trade.id.slice(-4)} due to ${status}. PnL: ${pnl.toFixed(2)}`);

    // Handle re-entry logic
    const now = new Date(new Date().getTime() + IST_OFFSET);
    if (now.getUTCHours() < configRef.current.reentryCutoffHour) {
      if (status === TradeStatus.CLOSED_SL || status === TradeStatus.CLOSED_TP) {
        addLog(`Searching for re-entry for ${trade.type}...`);
        setTimeout(() => createNewTrade(trade.type, true), 2000); // Simulate finding new strike
      }
    } else {
        addLog(`Re-entry cutoff time reached. No more re-entries.`);
    }

  }, [updateTrade, addLog, createNewTrade]);

  useEffect(() => {
    if (!isBotRunning) return;

    const timer = setInterval(() => {
      const now = new Date(new Date().getTime() + IST_OFFSET);
      setCurrentTime(now);

      // Main trade simulation logic
      setTrades(prevTrades => prevTrades.map(trade => {
        if (trade.status !== TradeStatus.ACTIVE) return trade;

        // Simulate price movement
        const priceChange = (Math.random() - 0.5) * (trade.entryPrice * 0.05);
        const newCurrentPrice = Math.max(0, trade.currentPrice + priceChange);

        // Check SL/TP
        if (newCurrentPrice >= trade.stopLossPrice) {
          closeTrade(trade.id, TradeStatus.CLOSED_SL, trade.stopLossPrice);
          return { ...trade, currentPrice: newCurrentPrice, status: TradeStatus.CLOSED_SL }; // Temp status update before closeTrade completes
        }
        if (newCurrentPrice <= trade.takeProfitPrice) {
          closeTrade(trade.id, TradeStatus.CLOSED_TP, trade.takeProfitPrice);
          return { ...trade, currentPrice: newCurrentPrice, status: TradeStatus.CLOSED_TP }; // Temp status update
        }
        
        const pnl = (trade.entryPrice - newCurrentPrice) * trade.quantity;
        return { ...trade, currentPrice: newCurrentPrice, pnl };
      }));

      // Check for entry time
      const isEntryTime = now.getUTCHours() === configRef.current.entryHour && now.getUTCMinutes() === configRef.current.entryMinute && now.getUTCSeconds() < 5;
      const isThursday = now.getUTCDay() === 4;
      const hasActiveTrades = tradesRef.current.some(t => t.status === TradeStatus.ACTIVE);

      if (isEntryTime && !hasActiveTrades && !(isThursday && configRef.current.noTradeOnThursday)) {
        addLog("Entry time reached. Placing initial trades...");
        createNewTrade(TradeType.CALL);
        createNewTrade(TradeType.PUT);
      }

      // Check for EOD square-off
      const isExitTime = now.getUTCHours() === configRef.current.exitHour && now.getUTCMinutes() === configRef.current.exitMinute;
      if (isExitTime) {
        addLog("EOD Square-off time reached. Closing all active positions.");
        tradesRef.current.forEach(trade => {
          if (trade.status === TradeStatus.ACTIVE) {
            closeTrade(trade.id, TradeStatus.CLOSED_EOD, trade.currentPrice);
          }
        });
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [isBotRunning, closeTrade, createNewTrade, addLog]);

  const squareOffAll = useCallback(() => {
    addLog("KILL SWITCH ACTIVATED! Squaring off all active positions immediately.");
    tradesRef.current.forEach(trade => {
      if (trade.status === TradeStatus.ACTIVE) {
        closeTrade(trade.id, TradeStatus.CLOSED_KILLED, trade.currentPrice);
      }
    });
  }, [addLog, closeTrade]);

  const manualSquareOff = useCallback((id: string) => {
    const trade = tradesRef.current.find(t => t.id === id);
    if (trade) {
        addLog(`Manually squaring off ${trade.type} #${trade.id.slice(-4)}...`);
        closeTrade(id, TradeStatus.CLOSED_MANUAL, trade.currentPrice);
    }
  }, [addLog, closeTrade]);

  const updateConfig = (newConfig: Partial<BotConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    addLog("Configuration updated.");
  };
  
  const toggleBot = () => {
    setIsBotRunning(prev => !prev);
    addLog(`Bot is now ${!isBotRunning ? 'RUNNING' : 'PAUSED'}.`);
  };

  return {
    config,
    trades,
    logs,
    currentTime,
    isBotRunning,
    updateConfig,
    squareOffAll,
    manualSquareOff,
    toggleBot,
  };
};
