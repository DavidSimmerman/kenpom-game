import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useTeamStore } from '../../stores/useTeamStore';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../ui/spinner';
import { Button } from '../ui/button';
import { BsGraphUpArrow, BsGraphDownArrow } from 'react-icons/bs';
import GoogleSignIn from '../Auth/GoogleSignIn';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';

export default function TeamCard() {
	const teamName = useTeamStore(s => s.teamName);
	const teamData = useTeamStore(s => s.teamData);
	const isLoading = useTeamStore(s => s.isLoading);
	const setTeam = useTeamStore(s => s.setTeam);

	const chartConfig = {
		netRating: {
			label: 'Net Rating',
			color: 'var(--chart-1)'
		}
	};

	const ratingHistory = useMemo(() => {
		return teamData?.history.map(history => ({ ...history, datetime: new Date(history.date) }));
	}, [teamData]);

	const prices = ratingHistory?.map(h => h.price) || [];
	const ranks = ratingHistory?.map(h => h.rank) || [];
	const netRatings = ratingHistory?.map(h => h.net_rating) || [];

	const CustomTooltip = (props: any) => {
		const { active, payload } = props;
		if (!active || !payload) return null;

		const orderedPayload = [
			payload.find((p: any) => p.dataKey === 'price'),
			payload.find((p: any) => p.dataKey === 'net_rating'),
			payload.find((p: any) => p.dataKey === 'rank')
		].filter(Boolean);

		return <ChartTooltipContent {...props} payload={orderedPayload} hideLabel />;
	};

	return (
		<Dialog open={teamName !== undefined} onOpenChange={open => !open && setTeam(undefined)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{teamData?.team}</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div className="m-auto py-16">
						<Spinner />
					</div>
				) : teamData ? (
					<div className="flex flex-col">
						<div>
							<ChartContainer config={chartConfig}>
								<LineChart accessibilityLayer data={ratingHistory} margin={{ left: 23, right: 12 }}>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="datetime"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={value =>
											`${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(
												2,
												'0'
											)}`
										}
									/>
									<YAxis yAxisId="price" hide domain={[-1, Math.max(120, ...prices) + 5]} />
									<YAxis
										yAxisId="netRating"
										hide
										domain={[Math.min(5, ...netRatings) - 3, Math.max(30, ...netRatings) + 3]}
									/>
									<YAxis yAxisId="ranks" reversed hide domain={[-3, Math.max(100, ...ranks) + 5]} />
									<ChartTooltip cursor={false} content={<CustomTooltip />} />
									<Line
										dataKey="net_rating"
										type="linear"
										stroke="oklch(54.6% 0.245 262.881 / .7)"
										strokeWidth={1}
										dot={false}
										yAxisId="netRating"
									/>

									<Line
										dataKey="rank"
										type="linear"
										stroke="oklch(55.8% 0.288 302.321 / .7)"
										strokeWidth={1}
										dot={false}
										yAxisId="ranks"
									/>

									<Line
										dataKey="price"
										type="linear"
										stroke="oklch(62.7% 0.194 149.214)"
										strokeWidth={3}
										dot={false}
										yAxisId="price"
									/>
								</LineChart>
							</ChartContainer>
						</div>
						<div className="grid grid-cols-2 mt-2">
							<span className="flex">
								<p className="text-muted-foreground">Rank:&nbsp;</p> <p className="font-bold">{teamData.rank}</p>
							</span>
							<span className="flex">
								<p className="text-muted-foreground">Win-Loss:&nbsp;</p>{' '}
								<p className="font-bold">{teamData.win_loss}</p>
							</span>
							<span className="flex">
								<p className="text-muted-foreground">Net Rating:&nbsp;</p>{' '}
								<p className="font-bold">{teamData.net_rating}</p>
							</span>
							<span className="flex">
								<p className="text-muted-foreground">Strength Of Schedule:&nbsp;</p>{' '}
								<p className="font-bold">{teamData.sos_net_rating_rank}</p>
							</span>
							<span className="flex">
								<p className="text-muted-foreground">Offensive Rating:&nbsp;</p>{' '}
								<p className="font-bold">{teamData.offensive_rating}</p>
							</span>
							<span className="flex">
								<p className="text-muted-foreground">Defensive Rating:&nbsp;</p>{' '}
								<p className="font-bold">{teamData.defensive_rating}</p>
							</span>
						</div>
						<TeamCardButtons />
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function TeamCardButtons() {
	const teamName = useTeamStore(s => s.teamName);
	const teamData = useTeamStore(s => s.teamData);

	const transactions = useTransactionStore(s => s.transactions);

	const { activeTransaction, profit } = useMemo(() => {
		let profit;
		const activeTransaction = transactions.find(t => t.team_key === teamData?.team_key && !t.sell_price);

		if (activeTransaction) {
			profit =
				activeTransaction.current_price * activeTransaction.shares -
				activeTransaction.buy_price * activeTransaction.shares;
			if (!activeTransaction.is_buy) {
				profit *= -1;
			}
		}

		return { activeTransaction, profit: profit?.toFixed(2) };
	}, [transactions, teamData]);

	const buyTeam = useTransactionStore(s => s.buyTeam);
	const sellTeam = useTransactionStore(s => s.sellTeam);

	const user = useAuthStore(s => s.user);
	const token = useAuthStore(s => s.token);
	const isAuthenticated = useAuthStore(s => s.isAuthenticated);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setError(null);
	}, [teamName]);

	const handleTransaction = async (action: 'buy' | 'short' | 'sell', shares = 1) => {
		if (!user || !token || !teamData) return;

		setIsSubmitting(true);
		setError(null);

		try {
			if (action === 'sell') {
				await sellTeam(teamData.team_key);
			} else {
				await buyTeam(teamData.team_key, action === 'buy', shares);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-600 text-sm">{error}</div>}
			<div className="mt-6 flex gap-3 w-full just">
				{isAuthenticated && user ? (
					activeTransaction && profit != null ? (
						<Button
							onClick={() => handleTransaction('sell')}
							disabled={isSubmitting}
							className={`min-w-[20%] ml-auto ${
								parseInt(profit) === 0
									? 'text-neutral-200 border-neutral-200/50 hover:bg-neutral-200/30'
									: parseInt(profit) > 0
									? 'text-green-600 border-green-600/50 hover:bg-green-600/30'
									: 'text-red-500 border-red-600/50 hover:bg-red-600/30'
							} bg-transparent  border-2  disabled:opacity-50`}
						>
							{isSubmitting ? 'Processing...' : `Sell for ${parseInt(profit) < 0 ? '-' : '+'}$${profit}`}
						</Button>
					) : (
						<>
							<Button
								onClick={() => handleTransaction('buy')}
								disabled={isSubmitting}
								className="w-[20%] ml-auto text-green-600 bg-transparent hover:bg-green-600/30 border-2 border-green-600/50 disabled:opacity-50"
							>
								{isSubmitting ? 'Processing...' : 'Buy'} <BsGraphUpArrow />
							</Button>
							<Button
								onClick={() => handleTransaction('short')}
								disabled={isSubmitting}
								className="w-[20%] text-red-600 bg-transparent hover:bg-red-600/30 border-2 border-red-600/50 disabled:opacity-50"
							>
								{isSubmitting ? 'Processing...' : 'Short'}
								<BsGraphDownArrow />
							</Button>
						</>
					)
				) : (
					<div className="ml-auto">
						<GoogleSignIn />
					</div>
				)}

				<DialogClose className="w-[20%] mr-auto">
					<Button className="w-full text-neutral-500 bg-transparent hover:bg-neutral-500/30 border-2 border-neutral-500/50">
						Cancel
					</Button>
				</DialogClose>
			</div>
		</>
	);
}
