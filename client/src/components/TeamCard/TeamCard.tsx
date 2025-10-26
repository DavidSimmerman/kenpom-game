import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useTeamStore } from '../../stores/useTeamStore';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useMemo } from 'react';
import { Spinner } from '../ui/spinner';
import { Button } from '../ui/button';
import { BsGraphUpArrow, BsGraphDownArrow } from 'react-icons/bs';

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
		// Generate test data for 10 days
		const testData = Array.from({ length: 10 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - (9 - i));
			return {
				date: date.toISOString().split('T')[0],
				datetime: date,
				rank: Math.floor(Math.random() * 50) + 1,
				net_rating: Math.random() * 30 + 5,
				price: Math.random() * 100 + 50
			};
		});
		return testData;
	}, [teamData]);

	const prices = ratingHistory?.map(h => h.price) || [];
	const ranks = ratingHistory?.map(h => h.rank) || [];
	const netRatings = ratingHistory?.map(h => h.net_rating) || [];

	const CustomTooltip = (props: any) => {
		const { active, payload } = props;
		if (!active || !payload) return null;

		// Reorder to show price first
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
										stroke="oklch(68.5% 0.169 237.323 / .3)"
										strokeWidth={2}
										dot={false}
										yAxisId="netRating"
									/>

									<Line
										dataKey="rank"
										type="linear"
										stroke="oklch(57.7% 0.245 27.325 / .3)"
										strokeWidth={2}
										dot={false}
										yAxisId="ranks"
									/>

									<Line
										dataKey="price"
										type="linear"
										stroke="oklch(72.3% 0.219 149.579)"
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
						<div className="mt-6 flex gap-3 w-full just">
							<Button className="w-[20%] ml-auto text-green-600 bg-transparent hover:bg-green-600/30 border-2 border-green-600/50">
								Buy <BsGraphUpArrow />
							</Button>
							<Button className="w-[20%] text-red-600 bg-transparent hover:bg-red-600/30 border-2 border-red-600/50">
								Short
								<BsGraphDownArrow />
							</Button>
							<DialogClose className="w-[20%] mr-auto">
								<Button className="w-full text-neutral-500 bg-transparent hover:bg-neutral-500/30 border-2 border-neutral-500/50">
									Cancel
								</Button>
							</DialogClose>
						</div>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
