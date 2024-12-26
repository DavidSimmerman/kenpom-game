import useFetchKenpom from '@/hooks/useFetchKenpom';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KenpomTeam } from '@/types/kenpom';

export default function RankingsList() {
	const { teams: teamIndex, loading } = useFetchKenpom();

	const teams = useMemo(() => teamIndex && Object.values(teamIndex), [teamIndex]);
	const headers = useMemo(() => teams && Object.keys(teams[0]).filter(h => !h.endsWith('_rank')), [teams]);

	return (
		<div>
			{!loading && (
				<Table>
					<TableHeader>
						<TableRow>{headers?.map(h => <TableHead key={`kp_header_item_${h}`}>{h}</TableHead>)}</TableRow>
					</TableHeader>
					<TableBody>
						{teams?.map(team => (
							<TableRow key={`kp_rankings_table_team_${team.name}`}>
								{Object.entries(team).map(([header, rank]) => {
									if (header.endsWith('_rank')) return null;

									const rankHeader = (header + '_rank') as keyof KenpomTeam;

									return (
										<TableCell className="text-center" key={`kp_rankings_table_team_${team.name}_${header}`}>
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
