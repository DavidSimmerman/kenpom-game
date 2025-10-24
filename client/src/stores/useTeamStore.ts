import { KenpomTeam } from '@/types/kenpom';
import { create } from 'zustand';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

type TeamState = {
	teamData: KenpomTeam | undefined;
	teamName: string | undefined;
	isLoading: boolean;
	setTeam: (team: any) => void;
};

export const useTeamStore = create<TeamState>(set => {
	function setTeam(teamName: string | undefined) {
		if (teamName == undefined) {
			set({ teamName: undefined, teamData: undefined, isLoading: false });
		} else {
			set({ teamName, isLoading: true });

			fetchKenpomTeam(teamName).then(team => {
				set({ teamData: team, isLoading: false });
			});
		}
	}

	return {
		teamName: undefined,
		teamData: undefined,
		isLoading: false,
		setTeam
	};
});

async function fetchKenpomTeam(teamName: string): Promise<KenpomTeam> {
	const response = await fetch(`${API_DOMAIN}/kenpom/team/${teamName}`);

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
