import { BadRequestError } from 'src/errors/Errors';
import { PostgresService } from './dbService';
import { fetchKenpomRankings, getPrice, getTeam } from './kenpomService';

const db = PostgresService.getInstance();

export async function getTransactions(userId: string, teamKey?: string, activeOnly: boolean = false) {
	let query = `SELECT *, buy_net_rating::float, sell_net_rating::float FROM user_transactions
        WHERE user_id = $1`;

	const params = [userId];

	if (teamKey) {
		query += `\nAND team_key = $2`;
		params.push(teamKey);
	}
	if (activeOnly) {
		query += `\nAND sell_rank IS NULL`;
	}

	const kenpomRankings = await fetchKenpomRankings();

	const transactions = await db.query(query, params);
	return transactions.map(t => ({
		...t,
		buy_price: getPrice(t.buy_net_rating, t.buy_rank),
		sell_price: t.sell_rank ? getPrice(t.sell_net_rating, t.sell_rank) : undefined,
		current_price: kenpomRankings[t.team_key].price
	}));
}

interface SaveTransactionOptions {
	action: 'buy' | 'short' | 'sell';
	shares?: number;
}

export async function saveTransaction(userId: string, teamKey: string, options: SaveTransactionOptions) {
	const { action = 'buy', shares = 1 } = options;

	const activeTransaction = (await getTransactions(userId, teamKey, true))[0];

	const teamData = await getTeam(teamKey);

	if (action === 'sell') {
		if (!activeTransaction) {
			throw new BadRequestError('No transaction for this team to sell.');
		}

		db.query(
			`UPDATE user_transactions
			SET sell_net_rating = $1,
				sell_rank = $2
			WHERE id = $3
			RETURNING *`,
			[teamData.net_rating, teamData.rank, activeTransaction.id]
		);
	} else {
		if (activeTransaction) {
			throw new BadRequestError('There is already an existing transaction for this user.');
		}

		const query = `INSERT INTO user_transactions (
			user_id, team_key, buy_net_rating, buy_rank, shares, is_buy
			) VALUES ($1, $2, $3, $4, $5, $6)
		`;

		db.query(query, [userId, teamKey, teamData.net_rating, teamData.rank, shares, action === 'buy']);
	}
}
