export interface KenpomRankings {
	[teamName: string]: KenpomTeam;
}

export interface KenpomTeam {
	rank: number;
	name: string;
	team: string;
	team_key: string;
	conference: string;
	win_loss: WinLossRecord;
	net_rating: number;
	offensive_rating: number;
	offensive_rating_rank: number;
	defensive_rating: number;
	defensive_rating_rank: number;
	adjusted_tempo: number;
	adjusted_tempo_rank: number;
	luck: number;
	luck_rank: number;
	sos_net_rating: number;
	sos_net_rating_rank: number;
	sos_offensive_rating: number;
	sos_offensive_rating_rank: number;
	sos_defensive_rating: number;
	sos_defensive_rating_rank: number;
	noncon_sos: number;
	noncon_sos_rank: number;
	price: number;
	history: TeamHistoryEntry[];
	trend?: 'up' | 'down' | undefined;
}

export interface TeamHistoryEntry {
	date: string;
	net_rating: number;
	price: number;
	rank: number;
}

export type WinLossRecord = `${number}-${number}`;
