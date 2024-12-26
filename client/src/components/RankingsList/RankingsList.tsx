import useFetchKenpom from '@/hooks/useFetchKenpom';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export default function RankingsList() {
	const { teams: teamIndex, loading } = useFetchKenpom();

	const teams = useMemo(() => teamIndex && Object.values(teamIndex), [teamIndex]);
	const headers = useMemo(() => teams && Object.keys(teams[0]), [teams]);

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
								{Object.values(team).map(rank => (
									<TableCell>{rank}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
