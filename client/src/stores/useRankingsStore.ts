import { KenpomRankings } from '@/types/kenpom';
import { create } from 'zustand';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

interface RankingsState {
	teamIndex: KenpomRankings | undefined;
	conferences: string[];
	isLoading: boolean;
	search: string | undefined;
	setSearch: (searchValue: string | undefined) => void;
	conferenceFilter: string[];
	setConferenceFilter: (conferences: string[]) => void;
}

export const useRankingsStore = create<RankingsState>(set => {
	fetchKenpomRankings().then(teamIndex => {
		const conferences = Array.from(new Set(Object.values(teamIndex).map(team => team.conference))).sort();
		set({
			teamIndex,
			conferences,
			isLoading: false
		});
	});

	return {
		teamIndex: undefined,
		conferences: [],
		isLoading: true,
		search: undefined,
		setSearch: (searchValue: string | undefined) => set({ search: searchValue }),
		conferenceFilter: [],
		setConferenceFilter: (conferences: string[]) => set({ conferenceFilter: conferences })
	};
});

async function fetchKenpomRankings(): Promise<KenpomRankings> {
	const response = await fetch(`${API_DOMAIN}/kenpom`);

	if (!response.ok) {
		throw new Error(response.status.toString());
	}

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error);
	} else {
		return data;
	}
}
