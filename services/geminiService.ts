
import { GoogleGenAI } from "@google/genai";
import { Trade } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getMarketAnalysis = async (trades: Trade[]): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key is not configured. Please set the API_KEY environment variable.";
  }

  const activeTrades = trades.filter(t => t.status === 'Active');
  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);

  const prompt = `
    You are a professional trading analyst providing insights for a BTC daily options straddle strategy.
    
    Current Portfolio Snapshot:
    - Total Realized & Unrealized PnL: ${totalPnl.toFixed(2)} USD
    - Active Positions: ${activeTrades.length > 0 ? activeTrades.map(t => `${t.type} @ ${t.entryPrice.toFixed(2)}`).join(', ') : 'None'}
    
    Based on this information and general BTC market knowledge, provide a concise market analysis.
    - Briefly comment on the current strategy's performance.
    - Mention one potential risk for the current open positions (e.g., a sudden volatility spike or drop).
    - Suggest one key price level for BTC to watch for the remainder of the trading session.
    
    Keep the analysis to a short, easily digestible paragraph. Do not use markdown.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini analysis:", error);
    return "Could not retrieve market analysis from Gemini. The model may be unavailable or the API key is invalid.";
  }
};
