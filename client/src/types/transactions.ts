export interface Transaction {
	team_key: string;
	created_at: string;
	updated_at: string;
	user_id: string;
	id: number;
	current_price: number;
	is_buy: boolean;
	shares: number;
	buy_net_rating: number;
	buy_price: number;
	buy_rank: number;
	sell_net_rating: number | undefined;
	sell_price: number | undefined;
	sell_rank: number | undefined;
}
