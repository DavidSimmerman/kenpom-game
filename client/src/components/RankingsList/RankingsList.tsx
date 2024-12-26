import useFetchKenpom from '@/hooks/useFetchKenpom';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KenpomTeam, WinLossRecord } from '@/types/kenpom';

export default function RankingsList() {
	const { teams: teamIndex, loading } = useFetchKenpom();
	const [sorting, setSorting] = useState<string>();

	const teams = useMemo(
		() =>
			teamIndex &&
			Object.values(teamIndex).sort((a, b) => {
				if (!sorting) return 0;

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
			}),
		[teamIndex, sorting]
	);
	const headers = useMemo(() => teams && Object.keys(teams[0]).filter(h => !h.endsWith('_rank')), [teams]);

	function getWinLossPct(win_loss: WinLossRecord) {
		const [winsString, lossesString] = win_loss.split('-');
		const wins = parseInt(winsString);
		const losses = parseInt(lossesString);

		return wins / (wins + losses);
	}

	return (
		<div>
			{!loading && (
				<Table>
					<TableHeader>
						<TableRow>
							{headers?.map(h => (
								<TableHead
									className={`capitalize hover:bg-muted/50 cursor-pointer text-center ${sorting === h && 'underline text-white'}`}
									onClick={() => setSorting(h)}
									key={`kp_header_item_${h}`}
								>
									{h.replaceAll('_', ' ')}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{teams?.map(team => (
							<TableRow key={`kp_rankings_table_team_${team.team}`}>
								{Object.entries(team).map(([header, rank]) => {
									if (header.endsWith('_rank')) return null;

									const rankHeader = (header + '_rank') as keyof KenpomTeam;

									return (
										<TableCell className="text-center" key={`kp_rankings_table_team_${team.team}_${header}`}>
											{team[rankHeader] ? (
												<>
													{rank}
													<span className="ml-1 text-xs text-gray-600">{team[rankHeader]}</span>
												</>
											) : (
												rank
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
