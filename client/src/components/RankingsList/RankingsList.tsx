import useFetchKenpom from '@/hooks/useFetchKenpom';

export default function RankingsList() {
	const { teams, loading } = useFetchKenpom();

	return <div>{!loading && Object.entries(teams || {}).map(([team, ranks]) => <div key={team}>{team}</div>)}</div>;
}
