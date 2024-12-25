export interface KenpomRankings {
	[teamName: string]: KenpomTeam;
}

export interface KenpomTeam {
	rank: number;
	team: string;
	conference: string;
	win_loss: string;
	net_rating: number;
	offensive_rating: number;
	offensive_rating_rank: number;
	defensive_rating: number;
	defensive_rating_rank: number;
	adjusted_tempo: number;
	adjusted_tempo_rank: number;
	luck: number;
	luck_rank: number;
	sos_net_rating: number; // Strength of Schedule Net Rating
	sos_net_rating_rank: number;
	sos_offensive_rating: number; // Strength of Schedule Offensive Rating
	sos_offensive_rating_rank: number;
	sos_defensive_rating: number; // Strength of Schedule Defensive Rating
	sos_defensive_rating_rank: number;
	noncon_sos: number; // Non-conference Strength of Schedule
	noncon_sos_rank: number;
}
