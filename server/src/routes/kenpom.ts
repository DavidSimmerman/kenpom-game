import { Router } from 'express';
import { getKenpomRankings, getKenpomTeam } from '../controllers/kenpom.js';

const router = Router();

router.get('/', getKenpomRankings);
router.get('/team/:teamKey', getKenpomTeam);

export default router;
