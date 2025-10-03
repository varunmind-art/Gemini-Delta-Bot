import { Router } from 'express';
import { DeltaExchangeService } from '../services/DeltaExchangeService';

export default function walletRoutes(deltaService: DeltaExchangeService) {
  const router = Router();

  router.get('/balance', async (req, res) => {
    try {
      const balance = await deltaService.getWalletBalance();
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
