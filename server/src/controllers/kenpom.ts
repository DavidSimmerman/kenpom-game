import { Request, Response } from 'express';
import { fetchKenpomRankings, getPrice } from '../services/kenpomService.js';
import { PostgresService } from '../services/dbService.js';

const db = PostgresService.getInstance();

export async function getKenpomRankings(_req: Request, res: Response) {
	const kpRankings = await fetchKenpomRankings();

	res.json(kpRankings);
}

export async function getKenpomTeam(req: Request, res: Response) {
	const teamKey = req.params.teamKey as string;

	const query = `
		SELECT
			rank,
			net_rating,
			TO_CHAR(date, 'YYYY-MM-DD') as date
		FROM kenpom_rankings
		WHERE team_key = $1
			AND date >= NOW() - INTERVAL '30 days'
		ORDER BY date DESC
	`;

	try {
		const queryPromise = db.query(query, [teamKey]);
		const kpPromise = fetchKenpomRankings();

		const [queryResults, kenpomRankings] = await Promise.all([queryPromise, kpPromise]);

		if (!Object.keys(kenpomRankings).includes(teamKey)) {
			return res.status(404).json({ error: `No team ${teamKey} found` });
		}

		res.json({
			...kenpomRankings[teamKey],
			history: queryResults.map(h => ({ ...h, price: getPrice(h) }))
		});
	} catch (error) {
		console.error('Error fetching team history:', error);
		res.status(500).json({ error: 'Failed to fetch team history' });
	}
}
