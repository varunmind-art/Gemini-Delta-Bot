import { WalletBalance, Trade } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await fetch(`${BACKEND_URL}/api/wallet/balance`);
  if (!response.ok) {
    throw new Error('Failed to fetch wallet balance');
  }
  return response.json();
};

export const squareOffAll = async (): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}/api/trading/square-off/all`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to square off all positions');
  }
};

export const squareOffTrade = async (tradeId: string): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}/api/trading/square-off/${tradeId}`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to square off trade');
  }
};

export const getServerIpAddress = async (): Promise<string> => {
  // This would be your actual AWS Lightsail IP
  return Promise.resolve("203.0.113.42");
};

// WebSocket connection for real-time updates
export const connectToTradingSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:3001`);
  
  ws.onopen = () => console.log('Connected to trading server');
  ws.onmessage = (event) => onMessage(JSON.parse(event.data));
  ws.onclose = () => console.log('Disconnected from trading server');
  
  return ws;
};
