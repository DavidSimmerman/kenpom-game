import { Router } from 'express';
import getKenpomRankings from '@controllers/kenpom.js';

const router = Router();

router.get('/', getKenpomRankings);

export default router;
