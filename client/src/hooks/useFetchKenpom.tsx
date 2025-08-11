import { KenpomRankings } from '@/types/kenpom';
import { useEffect, useRef, useState } from 'react';

const API_DOMAIN = 'http://192.168.1.56:3015';

export default function useFetchKenpom() {
	const responsePromise = useRef<Promise<void>>();
	const [loading, setLoading] = useState<boolean>();
	const [error, setError] = useState<string>();
	const [teams, setTeams] = useState<KenpomRankings>();

	useEffect(() => {
		getKenpomRankings();
	}, []);

	async function fetchKenpomAPI() {
		setLoading(true);

		const response = await fetch(`${API_DOMAIN}/kenpom`);

		if (!response.ok) {
			throw new Error(response.status.toString());
		}

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error);
		} else {
			setTeams(data);
		}
	}

	async function getKenpomRankings() {
		try {
			if (!responsePromise.current) responsePromise.current = fetchKenpomAPI();
			await responsePromise.current;
		} catch (error: unknown) {
			if (typeof error === 'string') {
				console.error(error);
				setError(error);
			} else if (error instanceof Error) {
				console.error(error.message);
				setError(error.message);
			} else {
				console.error('Unknown error:', error);
				setError('Unknown error');
			}
		} finally {
			setLoading(false);
		}
	}

	return { teams, loading, error };
}
