import OptionsBar from './OptionsBar';
import RankingsTable from './RankingsTable';
import { useRankingsStore } from '../../stores/useRankingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useEffect } from 'react';

export default function RankingsList() {
	const loading = useRankingsStore(s => s.isLoading);
	const user = useAuthStore(s => s.user);
	const loadTransactions = useTransactionStore(s => s.loadTransactions);

	useEffect(() => {
		if (!user) {
			return;
		}

		loadTransactions();
	}, [user]);

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
