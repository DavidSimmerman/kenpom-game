import { Router } from 'express';
import { buyTeam, getTransactions, sellTeam } from 'src/controllers/transactions.js';

const router = Router();

router.get('/:userId', getTransactions);
router.put('/:userId/buy/:teamKey', buyTeam);
router.patch('/:userId/sell/:teamKey', sellTeam);

export default router;
