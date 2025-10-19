import useFetchKenpom from '@/hooks/useFetchKenpom';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KenpomTeam, WinLossRecord } from '@/types/kenpom';
import { MdOutlineTrendingDown, MdOutlineTrendingFlat, MdOutlineTrendingUp } from 'react-icons/md';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import Fuse from 'fuse.js';

export default function RankingsList() {
	const { teams: teamIndex, loading } = useFetchKenpom();
	const [sorting, setSorting] = useState<keyof KenpomTeam>();
	const [search, setSearch] = useState<string>();

	const teams = useMemo(() => {
		if (!teamIndex) return;

		let filteredTeams = Object.values(teamIndex);

		if (search && search.trim()) {
			const fuse = new Fuse(filteredTeams, {
				keys: ['team'],
				threshold: 0.3
			});
			filteredTeams = fuse.search(search).map(result => result.item);
		}

		return filteredTeams.sort((a, b) => {
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
	}, [teamIndex, sorting, search]);

	type KenpomTeamKey = Extract<keyof KenpomTeam, string>;
	const headers = useMemo<KenpomTeamKey[]>(() => {
		return (
			teams && Object.keys(teams[0] as KenpomTeam).filter((h): h is KenpomTeamKey => !h.endsWith('_rank') && h !== 'price')
		);
	}, [teamIndex]);

	function getWinLossPct(win_loss: WinLossRecord) {
		const [winsString, lossesString] = win_loss.split('-');
		const wins = parseInt(winsString);
		const losses = parseInt(lossesString);

		return wins / (wins + losses);
	}

	const trendIconMap = {
		flat: <MdOutlineTrendingFlat className="ml-1 text-gray-600" size={16} />,
		up: <MdOutlineTrendingUp className="ml-1 text-green-600" size={16} />,
		down: <MdOutlineTrendingDown className="ml-1 text-red-600" size={16} />
	};

	return (
		<>
			{!loading && (
				<div className="h-screen flex flex-col">
					<div className="bg-secondary pt-2 z-10">
						<div className="flex ml-4">
							<IoSearch className="text-muted-foreground my-auto mr-4" size={20} />
							<Input
								className=" w-[400px] bg-neutral-900 border-neutral-600"
								placeholder="Search Team"
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
						</div>
					</div>
					<ScrollArea className="h-screen border w-fit min-w-full overflow-x-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-secondary ">
								<TableRow>
									<TableHead
										className={`capitalize hover:bg-muted/50 cursor-pointer text-center ${
											sorting === 'price' && 'underline text-white'
										}`}
										onClick={() => setSorting('price')}
										key={`kp_header_item_price`}
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
									<TableRow key={`kp_rankings_table_team_${team.team}`}>
										<TableCell
											className="text-center flex w-full justify-between items-center"
											key={`kp_rankings_table_team_${team.team}_price`}
										>
											<span>$&nbsp;</span>
											<span>{team.price.toFixed(2)}</span>
											{/* {Object.values(trendIconMap)[Math.floor(Math.random() * 3)]} */}
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
				</div>
			)}
		</>
	);
}
