import { KenpomTeam } from '@/types/kenpom';

export type KenpomTeamKey = Extract<keyof KenpomTeam, string>;

export interface RankingsTableProps {
	teams: KenpomTeam[];
	sorting?: keyof KenpomTeam;
	onSortChange: (key: keyof KenpomTeam) => void;
}

export interface OptionsBarProps {
	value?: string;
	onChange: (value: string) => void;
	conferences: string[];
}
