import { useTeamStore } from '../../stores/useTeamStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export default function TeamCard() {
	const teamName = useTeamStore(s => s.teamName);
	const teamData = useTeamStore(s => s.teamData);
	const isLoading = useTeamStore(s => s.isLoading);
	const setTeam = useTeamStore(s => s.setTeam);

	return (
		<Dialog open={teamName !== undefined} onOpenChange={(open) => !open && setTeam(undefined)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{teamName}</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : teamData ? (
					<div>
						<p>Rank: {teamData.rank}</p>
						<p>Net Rating: {teamData.net_rating}</p>
						<p>Conference: {teamData.conference}</p>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
