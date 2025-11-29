import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KenpomTeam } from '@/types/kenpom';
import { KenpomTeamKey } from './types';
import { useRankingsStore } from '../../stores/useRankingsStore';
import { filterTeams, sortTeams } from './utils';
import { useTeamStore } from '@/stores/useTeamStore';
import { HiCurrencyDollar } from 'react-icons/hi';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { BsGraphDownArrow, BsGraphUpArrow } from 'react-icons/bs';

export default function RankingsTable() {
	const teamIndex = useRankingsStore(s => s.teamIndex);
	const search = useRankingsStore(s => s.search);
	const conferenceFilter = useRankingsStore(s => s.conferenceFilter);
	const investedFilter = useRankingsStore(s => s.investedFilter);
	const setTeam = useTeamStore(s => s.setTeam);
	const transactions = useTransactionStore(s => s.transactions);

	const [sorting, setSorting] = useState<keyof KenpomTeam>();

	const teams = useMemo(() => {
		if (!teamIndex) return;

		const allTeams = Object.values(teamIndex);
		const filteredTeams = filterTeams({ teams: allTeams, search, conferenceFilter, investedFilter });
		return sortTeams(filteredTeams, sorting);
	}, [teamIndex, search, sorting, conferenceFilter, investedFilter]);

	const headers = useMemo<KenpomTeamKey[]>(() => {
		if (!teams || teams.length === 0) return [];
		return Object.keys(teams[0] as KenpomTeam).filter(
			(h): h is KenpomTeamKey => !h.endsWith('_rank') && h !== 'price' && h !== 'team_key' && h !== 'trend'
		);
	}, [teams]);

	return teams?.length === 0 ? (
		<div className="mx-auto my-8 text-neutral-400">No teams found</div>
	) : (
		<div className="h-screen w-full overflow-x-auto overflow-y-auto">
			<Table className="text-xs w-max min-w-full">
				<TableHeader className="sticky top-0 bg-secondary z-10">
					<TableRow>
						<TableHead
							className={`capitalize hover:bg-neutral-700/40 cursor-pointer text-center ${
								sorting === 'price' && 'underline text-white'
							}`}
							onClick={() => setSorting('price')}
							key="kp_header_item_price"
						>
							$
						</TableHead>
						{headers?.map(h => (
							<TableHead
								className={`capitalize hover:bg-neutral-700/40 cursor-pointer text-center ${
									sorting === h && 'underline text-white'
								}`}
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
						<TableRow
							onClick={() => setTeam(team.team_key)}
							key={`kp_rankings_table_team_${team.team}`}
							className="cursor-pointer text-base"
						>
							<TableCell
								className="text-center flex w-full justify-between items-center"
								key={`kp_rankings_table_team_${team.team}_price`}
							>
								<span>$&nbsp;</span>
								<span className="mr-1">{team.price.toFixed(2)}</span>
								<span className="ml-auto">
									{team.trend &&
										(team.trend === 'up' ? (
											<BsGraphUpArrow className="text-green-500" />
										) : (
											<BsGraphDownArrow className="text-red-500" />
										))}
								</span>
							</TableCell>
							{Object.entries(team).map(([header, rank]) => {
								if (header.endsWith('_rank') || header === 'price' || header === 'team_key' || header === 'trend')
									return null;

								const rankHeader = (header + '_rank') as keyof KenpomTeam;

								return (
									<TableCell
										className="text-center whitespace-nowrap"
										key={`kp_rankings_table_team_${team.team}_${header}`}
									>
										<div className="flex items-center justify-center gap-1">
											{team[rankHeader] ? (
												<>
													{rank}
													<span className="ml-1 text-xs text-gray-600">{team[rankHeader]}</span>
												</>
											) : (
												rank
											)}
											{header === 'team' &&
												transactions.find(t => t.team_key === team.team_key && !t.sell_rank) && (
													<HiCurrencyDollar className="text-blue-500 size-4" />
												)}
										</div>
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
