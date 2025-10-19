import * as cheerio from 'cheerio';

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
} & { price: number };

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

		teamInfo['price'] = getPrice(teamInfo);

		acc[teamInfo.team] = teamInfo;

		return acc;
	}, {});

	return teams;
}

export function getPrice(team: TeamData) {
	let price = Math.max((100 * (team.net_rating + 5)) / 40, 0.01);

	if (team.net_rating > 43) {
		price += 100;
	} else if (team.net_rating > 40) {
		price += 50;
	} else if (team.net_rating > 37) {
		price += 15;
	} else if (team.net_rating > 35) {
		price += 5;
	}

	if (team.rank === 1) {
		price += 25;
	} else if (team.rank <= 3) {
		price += 20;
	} else if (team.rank <= 5) {
		price += 15;
	} else if (team.rank <= 10) {
		price += 10;
	} else if (team.rank <= 20) {
		price += 5;
	} else if (team.rank <= 30) {
		price += 2.5;
	}

	price = Math.round(price * 100) / 100;

	return price;
}
