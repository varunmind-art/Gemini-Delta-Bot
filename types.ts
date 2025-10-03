
export enum TradeType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export enum TradeStatus {
  ACTIVE = 'Active',
  CLOSED_SL = 'Closed (SL)',
  CLOSED_TP = 'Closed (TP)',
  CLOSED_EOD = 'Closed (EOD)',
  CLOSED_MANUAL = 'Closed (Manual)',
  CLOSED_KILLED = 'Closed (Kill Switch)',
}

export interface Trade {
  id: string;
  type: TradeType;
  status: TradeStatus;
  strikePrice: number;
  entryTime: string;
  exitTime?: string;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  currentPrice: number;
  exitPrice?: number;
  pnl: number;
  quantity: number;
}

export interface BotConfig {
  quantity: number;
  premiumMin: number;
  premiumMax: number;
  premiumGap: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  entryHour: number;
  entryMinute: number;
  exitHour: number;
  exitMinute: number;
  reentryCutoffHour: number;
  noTradeOnThursday: boolean;
}

export interface WalletBalance {
  total: number;
  available: number;
  currency: string;
}
