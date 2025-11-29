import * as cheerio from 'cheerio';
import { PostgresService } from './dbService.js';
import { BadRequestError } from '../errors/Errors.js';

const db = PostgresService.getInstance();

const HEADERS = [
	'rank',
	'team',
	'conference',
	'win_loss',
	'net_rating',
	'offensive_rating',
	'offensive_rating_rank',
	'defensive_rating',
	'defensive_rating_rank',
	'adjusted_tempo',
	'adjusted_tempo_rank',
	'luck',
	'luck_rank',
	'sos_net_rating',
	'sos_net_rating_rank',
	'sos_offensive_rating',
	'sos_offensive_rating_rank',
	'sos_defensive_rating',
	'sos_defensive_rating_rank',
	'noncon_sos',
	'noncon_sos_rank'
] as const;

type Header = (typeof HEADERS)[number];

type TeamData = {
	[K in Header]: K extends 'team' | 'conference' | 'win_loss' ? string : number;
} & { price: number; team_key: string; trend?: 'up' | 'down' | undefined };

type KenpomData = Record<string, TeamData>;

export async function fetchKenpomRankings(): Promise<KenpomData> {
	const response = await fetch('https://kenpom.com/');
	const data = await response.text();

	const $ = cheerio.load(data);

	const rows = $('#ratings-table tbody tr');

	const teams: KenpomData = Array.from(rows).reduce<KenpomData>((acc, tr) => {
		const teamInfo = {} as TeamData;

		$(tr)
			.children()
			.each((i, td) => {
				const tdContent = $(td).text().trim();
				const header = HEADERS[i] as Header;

				if (header === 'team' || header === 'conference' || header === 'win_loss') {
					teamInfo[header] = tdContent;
				} else if (header.endsWith('rank')) {
					teamInfo[header] = parseInt(tdContent);
				} else if (!isNaN(Number(tdContent))) {
					teamInfo[header] = parseFloat(tdContent);
				}
			});

		teamInfo['price'] = getPrice(teamInfo.net_rating, teamInfo.rank);
		teamInfo['team_key'] = teamInfo.team
			.toLowerCase()
			.replaceAll(' ', '_')
			.replaceAll(/[^a-z_]/g, '');

		acc[teamInfo.team_key] = teamInfo;

		return acc;
	}, {});

	return teams;
}

export function getPrice(net_rating: number, rank: number) {
	let price = Math.max((100 * (net_rating + 5)) / 40, 0.01);

	if (net_rating > 43) {
		price += 100;
	} else if (net_rating > 40) {
		price += 50;
	} else if (net_rating > 37) {
		price += 15;
	} else if (net_rating > 35) {
		price += 5;
	}

	if (rank === 1) {
		price += 25;
	} else if (rank <= 3) {
		price += 20;
	} else if (rank <= 5) {
		price += 15;
	} else if (rank <= 10) {
		price += 10;
	} else if (rank <= 20) {
		price += 5;
	} else if (rank <= 30) {
		price += 2.5;
	}

	price = Math.round(price * 100) / 100;

	return price;
}

export async function getTeam(teamKey: string) {
	const query = `
		SELECT
			rank,
			net_rating::float as net_rating,
			TO_CHAR(date, 'YYYY-MM-DD') as date
		FROM kenpom_rankings
		WHERE team_key = $1
			AND date >= NOW() - INTERVAL '30 days'
		ORDER BY date ASC
	`;

	try {
		const queryPromise = db.query(query, [teamKey]);
		const kpPromise = fetchKenpomRankings();

		const [queryResults, kenpomRankings] = await Promise.all([queryPromise, kpPromise]);

		if (!Object.keys(kenpomRankings).includes(teamKey)) {
			throw new BadRequestError(`No team ${teamKey} found`);
		}

		return {
			...kenpomRankings[teamKey],
			history: queryResults.map(h => ({ ...h, price: getPrice(h.net_rating, h.rank) }))
		};
	} catch (error) {
		console.error('Error fetching team history:', error);
		throw new Error('Failed to fetch team history');
	}
}

export async function getSnapshot(days = 7) {
	const query = `
		SELECT
			team_key,
			rank,
			net_rating::float as net_rating
		FROM kenpom_rankings
		WHERE date::date = CURRENT_DATE - ($1 * INTERVAL '1 day')
	`;

	try {
		const results = await db.query(query, [days]);

		const snapshotMap: Record<string, { rank: number; net_rating: number; price: number }> = {};

		results.forEach(
			row =>
				(snapshotMap[row.team_key] = {
					rank: row.rank,
					net_rating: row.net_rating,
					price: getPrice(row.net_rating, row.rank)
				})
		);

		return snapshotMap;
	} catch (error) {
		console.error('Error fetching team history:', error);
		throw new Error('Failed to fetch team history');
	}
}
