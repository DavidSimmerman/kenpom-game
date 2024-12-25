import { KenpomRankings } from '@/types/kenpom';
import { useRef, useState } from 'react';
import { useCookies } from 'react-cookie';

const API_DOMAIN = 'http://localhost:3000';

export default function useFetchKenpom() {
	const responsePromise = useRef<Promise<void>>();
	const [loading, setLoading] = useState<boolean>();
	const [error, setError] = useState<string>();

	const [{ kenpomRankings }, setCookie] = useCookies(['kenpomRankings']);

	const teams = kenpomRankings as KenpomRankings;

	getKenpomRankings();

	async function fetchKenpomAPI() {
		if (teams) return;

		const response = await fetch(`${API_DOMAIN}/kenpom`);

		if (!response.ok) {
			throw new Error(response.status.toString());
		}

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error);
		} else {
			setCookie('kenpomRankings', JSON.stringify(data.rankings));
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
