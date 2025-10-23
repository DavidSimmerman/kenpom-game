import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { KenpomTeam } from '@/types/kenpom';
import { RankingsTableProps, KenpomTeamKey } from './types';

export default function RankingsTable({ teams, sorting, onSortChange }: RankingsTableProps) {
	const headers = useMemo<KenpomTeamKey[]>(() => {
		if (!teams || teams.length === 0) return [];
		return Object.keys(teams[0] as KenpomTeam).filter((h): h is KenpomTeamKey => !h.endsWith('_rank') && h !== 'price');
	}, [teams]);

	return (
		<ScrollArea className="h-screen border w-fit min-w-full overflow-x-auto">
			<Table>
				<TableHeader className="sticky top-0 bg-secondary">
					<TableRow>
						<TableHead
							className={`capitalize hover:bg-neutral-700/40 cursor-pointer text-center ${
								sorting === 'price' && 'underline text-white'
							}`}
							onClick={() => onSortChange('price')}
							key="kp_header_item_price"
						>
							$
						</TableHead>
						{headers?.map(h => (
							<TableHead
								className={`capitalize hover:bg-neutral-700/40 cursor-pointer text-center ${
									sorting === h && 'underline text-white'
								}`}
								onClick={() => onSortChange(h)}
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
							<TableCell
								className="text-center flex w-full justify-between items-center"
								key={`kp_rankings_table_team_${team.team}_price`}
							>
								<span>$&nbsp;</span>
								<span>{team.price.toFixed(2)}</span>
							</TableCell>
							{Object.entries(team).map(([header, rank]) => {
								if (header.endsWith('_rank') || header === 'price') return null;

								const rankHeader = (header + '_rank') as keyof KenpomTeam;

								return (
									<TableCell
										className="text-center whitespace-nowrap"
										key={`kp_rankings_table_team_${team.team}_${header}`}
									>
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
		</ScrollArea>
	);
}
