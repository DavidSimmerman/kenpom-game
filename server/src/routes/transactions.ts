import { Router } from 'express';
import { buyTeam, getTransactions, sellTeam } from 'src/controllers/transactions.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getTransactions);
router.put('/buy/:teamKey', authenticateToken, buyTeam);
router.patch('/sell/:teamKey', authenticateToken, sellTeam);

export default router;
