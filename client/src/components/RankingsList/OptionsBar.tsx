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
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Spinner } from '../ui/spinner';
import { useTeamStore } from '@/stores/useTeamStore';

const POWER_CONFERENCES = ['ACC', 'B10', 'B12', 'BE', 'SEC'];

export default function OptionsBar() {
	const search = useRankingsStore(s => s.search);
	const setSearch = useRankingsStore(s => s.setSearch);

	return (
		<div className="bg-secondary pt-2 z-10 flex w-full">
			<div className="flex ml-4 gap-2">
				<IoSearch className="text-neutral-600 my-auto mr-2" size={20} />
				<Input
					className="w-[400px] bg-neutral-900 border-neutral-600"
					placeholder="Search Team"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<FilterPopover />
			</div>
			<div className="ml-auto mr-4 flex gap-2">
				<div className="h-full bg-transparent hover:bg-neutral-700/40 aspect-square rounded-lg flex">
					<GrCircleQuestion className="text-neutral-600 m-auto w-[60%] h-[60%]" />
				</div>
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

function HistoryPopover() {
	const user = useAuthStore(s => s.user);
	const transactionsLoading = useTransactionStore(s => s.isLoading);
	const transactions = useTransactionStore(s => s.transactions);
	const setTeam = useTeamStore(s => s.setTeam);

	const { activeTransactions, pastTransactions } = useMemo((): {
		activeTransactions: any[];
		pastTransactions: any[];
	} => {
		const activeTransactions: any[] = [];
		const pastTransactions: any[] = [];
		if (!transactions) {
			return { activeTransactions, pastTransactions };
		}

		const sortedTransactions = transactions.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
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
				<TableRow className="cursor-pointer" onClick={() => setTeam(t.team_key)}>
					<TableCell className="text-left">{t.team_key}</TableCell>
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
				<PopoverContent className="bg-neutral-700 mr-4 text-neutral-300 text-xl p-5 w-fit">
					<div>Active</div>
					<Table className="text-center">
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

					<div>History</div>
					<Table className="text-center">
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
				</PopoverContent>
			</Popover>
		))
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
