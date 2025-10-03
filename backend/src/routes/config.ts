import { Router } from 'express';
import { TradingEngine } from '../services/TradingEngine';

export default function configRoutes(tradingEngine: TradingEngine) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(tradingEngine.getConfig());
  });

  router.put('/', (req, res) => {
    try {
      tradingEngine.updateConfig(req.body);
      res.json({ success: true, message: 'Configuration updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
