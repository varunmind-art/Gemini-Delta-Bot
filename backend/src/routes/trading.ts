import { Router } from 'express';
import { TradingEngine } from '../services/TradingEngine';

export default function tradingRoutes(tradingEngine: TradingEngine) {
  const router = Router();

  router.get('/trades', (req, res) => {
    res.json({
      active: tradingEngine.getActiveTrades(),
      all: tradingEngine.getAllTrades()
    });
  });

  router.post('/square-off/all', async (req, res) => {
    try {
      await tradingEngine.squareOffAll();
      res.json({ success: true, message: 'All positions squared off' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/square-off/:tradeId', async (req, res) => {
    try {
      const trade = tradingEngine.getAllTrades().find(t => t.id === req.params.tradeId);
      if (!trade) {
        return res.status(404).json({ success: false, error: 'Trade not found' });
      }
      
      await tradingEngine.squareOffTrade(trade, 'CLOSED_MANUAL');
      res.json({ success: true, message: 'Trade squared off' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/start', (req, res) => {
    tradingEngine.start();
    res.json({ success: true, message: 'Trading bot started' });
  });

  router.post('/stop', (req, res) => {
    tradingEngine.stop();
    res.json({ success: true, message: 'Trading bot stopped' });
  });

  return router;
}
