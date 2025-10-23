import { KenpomTeam, WinLossRecord } from '@/types/kenpom';
import Fuse from 'fuse.js';

export function getWinLossPct(win_loss: WinLossRecord): number {
	const [winsString, lossesString] = win_loss.split('-');
	const wins = parseInt(winsString);
	const losses = parseInt(lossesString);

	return wins / (wins + losses);
}

export function filterTeams(teams: KenpomTeam[], searchTerm?: string): KenpomTeam[] {
	if (!searchTerm || !searchTerm.trim()) {
		return teams;
	}

	const fuse = new Fuse(teams, {
		keys: ['team'],
		threshold: 0.3
	});

	return fuse.search(searchTerm).map(result => result.item);
}

export function sortTeams(teams: KenpomTeam[], sorting?: keyof KenpomTeam): KenpomTeam[] {
	return [...teams].sort((a, b) => {
		if (!sorting) return 0;

		if (sorting === 'price') {
			return 0;
		}

		const rankKey = (sorting + '_rank') as keyof KenpomTeam;
		const sortKey = (a[rankKey] ? rankKey : sorting) as keyof KenpomTeam;

		if (sortKey === 'win_loss') {
			return getWinLossPct(b.win_loss) - getWinLossPct(a.win_loss);
		} else if (typeof a[sortKey] === 'string') {
			return a[sortKey].localeCompare(b[sortKey] as string);
		} else if (sortKey.endsWith('rank')) {
			return (a[sortKey] as number) - (b[sortKey] as number);
		} else {
			return (b[sortKey] as number) - (a[sortKey] as number);
		}
	});
}
