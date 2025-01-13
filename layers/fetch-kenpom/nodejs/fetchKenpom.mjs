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
];

export async function fetchKenpom() {
	const response = await fetch('https://kenpom.com/');
	const data = await response.text();

	const $ = cheerio.load(data);

	const rows = $('#ratings-table tbody tr');

	const teams = Array.from(rows).reduce((acc, tr) => {
		const teamInfo = {};

		$(tr)
			.children()
			.each((i, td) => {
				const tdContent = $(td).text().trim();
				const header = HEADERS[i];

				if (header.endsWith('rank')) teamInfo[header] = parseInt(tdContent);
				else if (!isNaN(tdContent)) teamInfo[header] = parseFloat(tdContent);
				else teamInfo[header] = tdContent;
			});

		acc[teamInfo.team] = teamInfo;

		return acc;
	}, {});

	return teams;
}
