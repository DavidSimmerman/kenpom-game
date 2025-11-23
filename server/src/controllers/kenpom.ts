import { Request, Response } from 'express';
import { fetchKenpomRankings, getTeam } from '../services/kenpomService.js';
import { PostgresService } from '../services/dbService.js';
import { BadRequestError } from 'src/errors/Errors.js';

const db = PostgresService.getInstance();

export async function getKenpomRankings(_req: Request, res: Response) {
	const kpRankings = await fetchKenpomRankings();

	res.json(kpRankings);
}

export async function getKenpomTeam(req: Request, res: Response) {
	const teamKey = req.params.teamKey as string;

	try {
		const team = await getTeam(teamKey);

		res.json(team);
	} catch (error: any) {
		if (error instanceof BadRequestError) {
			return res.status(400).json({ error: error.message });
		}

		console.error('Error fetching team history:', error.message);
		res.status(500).json({ error: 'Failed to fetch team history' });
	}
}
