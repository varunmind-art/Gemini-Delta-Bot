
import { BotConfig } from './types';

export const DEFAULT_CONFIG: BotConfig = {
  quantity: 1, // in lots
  premiumMin: 360,
  premiumMax: 440,
  premiumGap: 50,
  stopLossPercentage: 90,
  takeProfitPercentage: 90,
  entryHour: 21,
  entryMinute: 35,
  exitHour: 17,
  exitMinute: 25,
  reentryCutoffHour: 15,
  noTradeOnThursday: true,
};
