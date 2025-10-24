import OptionsBar from './OptionsBar';
import RankingsTable from './RankingsTable';
import { useRankingsStore } from '../../stores/useRankingsStore';

export default function RankingsList() {
	const loading = useRankingsStore(s => s.isLoading);

	return (
		<>
			{!loading && (
				<div className="h-screen flex flex-col w-screen">
					<OptionsBar />
					<RankingsTable />
				</div>
			)}
		</>
	);
}
