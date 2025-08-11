import { PostgresService } from '../services/dbService.js';
import { fetchKenpomRankings } from '../services/kenpomService.js';

const SAVE_TEAM_QUERY = `
		INSERT INTO kenpom_rankings (
			rank, team, conference, win_loss,
			net_rating, offensive_rating, offensive_rating_rank,
			defensive_rating, defensive_rating_rank,
			adjusted_tempo, adjusted_tempo_rank,
			luck, luck_rank,
			sos_net_rating, sos_net_rating_rank,
			sos_offensive_rating, sos_offensive_rating_rank,
			sos_defensive_rating, sos_defensive_rating_rank,
			noncon_sos, noncon_sos_rank
		) VALUES (
			$1, $2, $3, $4, 
            $5, $6, $7, 
            $8, $9, 
            $10, $11, 
            $12, $13, 
            $14, $15, 
            $16, $17, 
            $18, $19, 
            $20, $21
		)
	`;

const db = PostgresService.getInstance();

export async function saveKenpom() {
	try {
		console.log('Beginning downloading kenpom rankings');
		const kenpomRankings = await fetchKenpomRankings();
		await db.transaction(
			Object.values(kenpomRankings).map(team => ({
				query: SAVE_TEAM_QUERY,
				params: [
					team.rank,
					team.team,
					team.conference,
					team.win_loss,
					team.net_rating,
					team.offensive_rating,
					team.offensive_rating_rank,
					team.defensive_rating,
					team.defensive_rating_rank,
					team.adjusted_tempo,
					team.adjusted_tempo_rank,
					team.luck,
					team.luck_rank,
					team.sos_net_rating,
					team.sos_net_rating_rank,
					team.sos_offensive_rating,
					team.sos_offensive_rating_rank,
					team.sos_defensive_rating,
					team.sos_defensive_rating_rank,
					team.noncon_sos,
					team.noncon_sos_rank
				]
			}))
		);
		console.log('Rankings successfully saved');
	} catch (err) {
		console.error(err);
	}
}
