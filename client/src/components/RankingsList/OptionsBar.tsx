import { Input } from '../ui/input';
import { IoBook, IoBookOutline, IoSearch } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useRankingsStore } from '../../stores/useRankingsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '@radix-ui/react-separator';
import { AvatarImage, Avatar, AvatarFallback } from '../ui/avatar';
import { GrCircleQuestion } from 'react-icons/gr';
import GoogleSignIn from '../Auth/GoogleSignIn';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useMemo, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Spinner } from '../ui/spinner';
import { useTeamStore } from '@/stores/useTeamStore';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';

const POWER_CONFERENCES = ['ACC', 'B10', 'B12', 'BE', 'SEC'];

export default function OptionsBar() {
	const search = useRankingsStore(s => s.search);
	const setSearch = useRankingsStore(s => s.setSearch);

	return (
		<div className="bg-secondary pt-4 md:pt-2 z-10 flex flex-col-reverse md:pb-2 md:flex-row w-screen">
			<div className="flex ml-4 gap-2 my-4 md:my-0">
				<IoSearch className="text-neutral-600 my-auto mr-2" size={20} />
				<Input
					className="w-[400px] bg-neutral-900 border-neutral-600"
					placeholder="Search Team"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<FilterPopover />
			</div>
			<div className="md:ml-auto mx-4 flex gap-2">
				<CurrentValue />
				<RulesPopup />
				<>
					<HistoryPopover />
					<UserAvatar />
				</>
			</div>
		</div>
	);
}

function FilterPopover() {
	const conferences = useRankingsStore(s => s.conferences);
	const conferenceFilter = useRankingsStore(s => s.conferenceFilter);
	const setConferenceFilter = useRankingsStore(s => s.setConferenceFilter);
	const investedFilter = useRankingsStore(s => s.investedFilter);
	const toggleInvestedFilter = useRankingsStore(s => s.toggleInvestedFilter);

	function toggleSelectAllConfs() {
		if (conferenceFilter.length === conferences.length) {
			setConferenceFilter([]);
		} else {
			setConferenceFilter(conferences);
		}
	}

	return (
		<Popover>
			<PopoverTrigger className="h-full bg-transparent hover:bg-neutral-700/40 aspect-square rounded-lg flex">
				<FaFilter className="text-neutral-600 m-auto" />
			</PopoverTrigger>
			<PopoverContent className="bg-neutral-700 mr-4 text-neutral-300 text-xl p-5 w-fit">
				<div className="text-2xl font-bold mb-2 text-neutral-200">Currently Invested In</div>
				<div className="grid grid-cols-[auto_auto_auto] gap-y-1 gap-x-6 mb-4">
					<div className="flex gap-2 cursor-pointer" onClick={() => toggleInvestedFilter('yes')}>
						<Checkbox checked={investedFilter.yes} className="my-auto" />
						Yes
					</div>
					<div className="flex gap-2 cursor-pointer" onClick={() => toggleInvestedFilter('no')}>
						<Checkbox checked={investedFilter.no} className="my-auto" />
						No
					</div>
				</div>

				<div className="text-2xl font-bold mb-2 text-neutral-200">Conferences</div>
				<div className="grid grid-cols-[auto_auto_auto] gap-y-1 gap-x-6">
					{POWER_CONFERENCES.map(conf => (
						<Conference key={`conf_filter_options_${conf}`} conference={conf} />
					))}
				</div>
				<Separator className="bg-neutral-500 my-2 mx-auto h-[1px] w-7/8" />
				<div className="grid grid-cols-[auto_auto_auto] gap-y-1 gap-x-6">
					{conferences
						.filter(c => !POWER_CONFERENCES.includes(c))
						.map(conf => (
							<Conference key={`conf_filter_options_${conf}`} conference={conf} />
						))}
				</div>
				<div className="flex w-full">
					<Button className="mt-3 mx-auto bg-neutral-500 py-2 h-fit" onClick={toggleSelectAllConfs}>
						Toggle Select All
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function Conference({ conference }: { conference: string }) {
	const conferenceFilter = useRankingsStore(s => s.conferenceFilter);
	const setConferenceFilter = useRankingsStore(s => s.setConferenceFilter);

	function toggleConf() {
		if (conferenceFilter.includes(conference)) {
			setConferenceFilter(conferenceFilter.filter(conf => conf !== conference));
		} else {
			setConferenceFilter([...conferenceFilter, conference]);
		}
	}

	return (
		<div className="flex gap-2 cursor-pointer" onClick={toggleConf}>
			<Checkbox checked={conferenceFilter.includes(conference)} className="my-auto" />
			{conference}
		</div>
	);
}

function CurrentValue() {
	const transactionsLoading = useTransactionStore(s => s.isLoading);
	const transactions = useTransactionStore(s => s.transactions);
	const user = useAuthStore(s => s.user);

	const totalProfit = useMemo(
		() =>
			transactions.reduce((total, team) => {
				let profit = (team.sell_price ?? team.current_price) * team.shares - team.buy_price * team.shares;

				if (!team.is_buy) {
					profit *= -1;
				}

				return total + profit;
			}, 0),
		[transactions]
	);

	let profitColor = '';

	if (totalProfit > 0) {
		profitColor = 'text-green-500';
	} else if (totalProfit < 0) {
		profitColor = 'text-red-500';
	}

	return (
		!transactionsLoading &&
		user && (
			<div className="flex gap-2 my-auto mr-auto md:mr-4">
				<div className="text-neutral-500">Total Profit:</div>
				<div className={`${profitColor}`}>
					{totalProfit < 0 ? '-' : '+'}${totalProfit.toFixed(2)}
				</div>
			</div>
		)
	);
}

function HistoryPopover() {
	const user = useAuthStore(s => s.user);
	const transactionsLoading = useTransactionStore(s => s.isLoading);
	const transactions = useTransactionStore(s => s.transactions);
	const setTeam = useTeamStore(s => s.setTeam);
	const teamIndex = useRankingsStore(s => s.teamIndex);

	const { activeTransactions, pastTransactions } = useMemo((): {
		activeTransactions: any[];
		pastTransactions: any[];
	} => {
		const activeTransactions: any[] = [];
		const pastTransactions: any[] = [];
		if (!transactions) {
			return { activeTransactions, pastTransactions };
		}

		const sortedTransactions = transactions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
		sortedTransactions.forEach(t => {
			let profit = (t.sell_price ?? t.current_price) * t.shares - t.buy_price * t.shares;

			if (!t.is_buy) {
				profit *= -1;
			}

			let profitColor = '';

			if (profit > 0) {
				profitColor = 'text-green-500';
			} else if (profit < 0) {
				profitColor = 'text-red-500';
			}

			const comp = (
				<TableRow
					className="cursor-pointer"
					onClick={() => setTeam(t.team_key)}
					key={`transaction_history_${t.team_key}_${t.sell_rank ? 'history' : 'active'}`}
				>
					<TableCell className="text-left">{teamIndex[t.team_key].team || t.team_key}</TableCell>
					<TableCell>${t.buy_price.toFixed(2)}</TableCell>
					<TableCell>{t.shares}</TableCell>
					<TableCell>${t.sell_price?.toFixed(2) ?? t.current_price.toFixed(2)}</TableCell>
					<TableCell>{t.is_buy ? 'buy' : 'short'}</TableCell>
					<TableCell className={profitColor}>{`${profit < 0 ? '-' : ''}$${Math.abs(profit).toFixed(2)}`}</TableCell>
				</TableRow>
			);

			if (t.sell_rank) {
				pastTransactions.push(comp);
			} else {
				activeTransactions.push(comp);
			}
		});

		return { activeTransactions, pastTransactions };
	}, [transactions]);

	return (
		user &&
		(transactionsLoading ? (
			<div className="flex">
				<Spinner className="m-auto text-neutral-600 size-5" />
			</div>
		) : (
			<Popover>
				<PopoverTrigger className="group h-full bg-transparent hover:bg-neutral-700/40 aspect-square rounded-lg flex">
					<IoBookOutline className="text-neutral-600 m-auto w-10 group-hover:hidden" size={24} />
					<IoBook className="text-neutral-600 m-auto w-10 hidden group-hover:block" size={24} />
				</PopoverTrigger>
				<PopoverContent
					className="
					bg-neutral-700 text-neutral-300 
					mr-4 p-5 
					text-sm md:text-xl 
					bottom-0 h-full
					md:max-h-[60vh]  
					w-fit max-w-[100vw]
					overflow-auto"
				>
					<div className="text-lg md:text-xl">Active</div>
					<Table className="text-center text-[.8rem]">
						<TableHeader>
							<TableRow>
								<TableHead>Team</TableHead>
								<TableHead>Buy Price</TableHead>
								<TableHead>Shares</TableHead>
								<TableHead>Current Price</TableHead>
								<TableHead>Buy/Short</TableHead>
								<TableHead>Profit</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>{activeTransactions.map(t => t)}</TableBody>
					</Table>
					{!activeTransactions.length && (
						<div className="text-center text-sm my-3 text-neutral-400">No current investments</div>
					)}

					<div className="text-lg md:text-xl mt-6 md:mt-0">History</div>
					<Table className="text-center text-[.8rem]">
						<TableHeader>
							<TableRow>
								<TableHead>Team</TableHead>
								<TableHead>Buy Price</TableHead>
								<TableHead>Shares</TableHead>
								<TableHead>Sell Price</TableHead>
								<TableHead>Buy/Short</TableHead>
								<TableHead>Profit</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>{pastTransactions.map(t => t)}</TableBody>
					</Table>
					{!pastTransactions.length && (
						<div className="text-center text-sm my-3 text-neutral-400">No investment history</div>
					)}
				</PopoverContent>
			</Popover>
		))
	);
}

function RulesPopup() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const hasSeenRules = localStorage.getItem('hasSeenRules');
		if (!hasSeenRules) {
			setIsOpen(true);
		}
	}, []);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			localStorage.setItem('hasSeenRules', 'true');
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger className="h-full bg-transparent hover:bg-neutral-700/40 aspect-square rounded-lg flex">
				<GrCircleQuestion className="text-neutral-600 m-auto w-[60%] h-[60%]" />
			</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader className="text-2xl font-bold">Kenpom Stocks Game</DialogHeader>
				<DialogDescription className="text-neutral-300 space-y-4">
					<div>
						<h3 className="text-lg font-semibold text-neutral-100 mb-2">How to Play</h3>
						<p className="mb-2">
							Show off your ball knowledge by buying and selling college basketball teams using <i>virtual money</i>{' '}
							based off their Kenpom rankings.
						</p>
						<ul className="list-disc list-outside space-y-1 ml-6">
							<li>
								<strong>Buy</strong>: Purchase shares when you think a team will move up in the rankings (price
								will increase)
							</li>
							<li>
								<strong>Short</strong>: Sell shares you don't own when you think a team will drop in rankings
								(price will decrease)
							</li>
							<li>
								<strong>Sell</strong> your current investments when you think they have peaked and you will lock
								in the profit you have made.
							</li>
							<li>
								The <strong>Total Profit</strong> is a calculation of all current investments as long as past ones
								you have sold.
							</li>
							<li>
								View your current and past transactions by clicking on the <strong>Book</strong> icon on the top
								left.
							</li>
							<li>Click on a team in the list to begin investing!</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-neutral-100 mb-2">Price Calculation</h3>
						<p className="mb-3">
							Each team's stock price is calculated using their <strong>Net Rating</strong> and{' '}
							<strong>Rank</strong>:
						</p>

						<div className="space-y-3">
							<div>
								<p className="font-semibold text-neutral-100 mb-1">1. Base Price (from Net Rating)</p>
								<div className="bg-neutral-800 p-2 rounded-md font-mono text-xs mb-1">
									Base = (100 × (Net Rating + 5)) ÷ 40
								</div>
								<p className="text-sm text-neutral-400">Minimum of $0.01</p>
							</div>

							<div>
								<p className="font-semibold text-neutral-100 mb-1">2. Net Rating Bonuses</p>
								<ul className="text-sm space-y-0.5 ml-2">
									<li>
										Net Rating {'>'} 43: <span className="text-green-400">+$100</span>
									</li>
									<li>
										Net Rating {'>'} 40: <span className="text-green-400">+$50</span>
									</li>
									<li>
										Net Rating {'>'} 37: <span className="text-green-400">+$15</span>
									</li>
									<li>
										Net Rating {'>'} 35: <span className="text-green-400">+$5</span>
									</li>
								</ul>
							</div>

							<div>
								<p className="font-semibold text-neutral-100 mb-1">3. Rank Bonuses</p>
								<ul className="text-sm space-y-0.5 ml-2">
									<li>
										Rank #1: <span className="text-green-400">+$25</span>
									</li>
									<li>
										Rank #2-3: <span className="text-green-400">+$20</span>
									</li>
									<li>
										Rank #4-5: <span className="text-green-400">+$15</span>
									</li>
									<li>
										Rank #6-10: <span className="text-green-400">+$10</span>
									</li>
									<li>
										Rank #11-20: <span className="text-green-400">+$5</span>
									</li>
									<li>
										Rank #21-30: <span className="text-green-400">+$2.50</span>
									</li>
								</ul>
							</div>
						</div>

						<p className="mt-3 text-sm text-neutral-400">
							The final price is the sum of all three components. Prices are updated in real time as they update on
							Kenpom.
						</p>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

function UserAvatar() {
	const user = useAuthStore(s => s.user);
	const isAuthenticated = useAuthStore(s => s.isAuthenticated);
	const logout = useAuthStore(s => s.logout);

	return isAuthenticated && user ? (
		<Popover>
			<PopoverTrigger>
				<Avatar>
					<AvatarImage src={user.picture || ''}></AvatarImage>
					<AvatarFallback className="bg-neutral-600">
						{user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</PopoverTrigger>
			<PopoverContent className="bg-neutral-700 mr-4 text-neutral-300 w-fit p-4">
				<div className="flex flex-col gap-2">
					<div className="text-sm text-neutral-400">{user.email}</div>
					{user.username && <div className="font-semibold">{user.username}</div>}
					<Button onClick={logout} className="mt-2 bg-neutral-600 hover:bg-neutral-500">
						Sign Out
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	) : (
		<GoogleSignIn />
	);
}
