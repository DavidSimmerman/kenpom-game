import useFetchKenpom from '@/hooks/useFetchKenpom';
import { useMemo, useState } from 'react';
import { KenpomTeam } from '@/types/kenpom';
import OptionsBar from './OptionsBar';
import RankingsTable from './RankingsTable';
import { filterTeams, sortTeams } from './utils';

export default function RankingsList() {
	const { teams: teamIndex, loading } = useFetchKenpom();
	const [sorting, setSorting] = useState<keyof KenpomTeam>();
	const [search, setSearch] = useState<string>();

	const conferences = useMemo(() => {
		if (!teamIndex) return [];

		return [...new Set(Object.values(teamIndex).map(t => t.conference))];
	}, [teamIndex]);

	const teams = useMemo(() => {
		if (!teamIndex) return;

		const allTeams = Object.values(teamIndex);
		const filteredTeams = filterTeams(allTeams, search);
		return sortTeams(filteredTeams, sorting);
	}, [teamIndex, sorting, search]);

	return (
		<>
			{!loading && (
				<div className="h-screen flex flex-col">
					<OptionsBar value={search} conferences={conferences} onChange={setSearch} />
					<RankingsTable teams={teams || []} sorting={sorting} onSortChange={setSorting} />
				</div>
			)}
		</>
	);
}
