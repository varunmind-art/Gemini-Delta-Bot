import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Routes
import tradingRoutes from './routes/trading';
import configRoutes from './routes/config';
import walletRoutes from './routes/wallet';

// Services
import { TradingEngine } from './services/TradingEngine';
import { DeltaExchangeService } from './services/DeltaExchangeService';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
const deltaService = new DeltaExchangeService();
const tradingEngine = new TradingEngine(deltaService);

// Routes
app.use('/api/trading', tradingRoutes(tradingEngine));
app.use('/api/config', configRoutes(tradingEngine));
app.use('/api/wallet', walletRoutes(deltaService));

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  
  // Send initial state
  const initialState = {
    type: 'INITIAL_STATE',
    data: {
      trades: tradingEngine.getActiveTrades(),
      config: tradingEngine.getConfig(),
      isRunning: tradingEngine.isRunning()
    }
  };
  
  ws.send(JSON.stringify(initialState));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast updates to all connected clients
tradingEngine.onUpdate((data) => {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`MochaBot Backend running on port ${PORT}`);
  tradingEngine.start();
});
