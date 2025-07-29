import { Request, Response } from 'express';
import { fetchKenpomRankings } from '@services/kenpomService.js';

export default async function getKenpomRankings(_req: Request, res: Response) {
	const kpRankings = await fetchKenpomRankings();

	res.json(kpRankings);
}
