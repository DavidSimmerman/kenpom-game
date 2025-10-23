import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useRankingsStore } from './useRankingsStore';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '@radix-ui/react-separator';

const POWER_CONFERENCES = ['ACC', 'B10', 'B12', 'BE', 'SEC'];

export default function OptionsBar() {
	const search = useRankingsStore(s => s.search);
	const setSearch = useRankingsStore(s => s.setSearch);
	const conferences = useRankingsStore(s => s.conferences);

	const conferenceFilter = useRankingsStore(s => s.conferenceFilter);
	const setConferenceFilter = useRankingsStore(s => s.setConferenceFilter);

	function toggleSelectAllConfs() {
		if (conferenceFilter.length === conferences.length) {
			setConferenceFilter([]);
		} else {
			setConferenceFilter(conferences);
		}
	}

	return (
		<div className="bg-secondary pt-2 z-10 flex ">
			<div className="flex ml-4">
				<IoSearch className="text-neutral-600 my-auto mr-4" size={20} />
				<Input
					className="w-[400px] bg-neutral-900 border-neutral-600"
					placeholder="Search Team"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>
			<div className="ml-auto mr-4">
				<Popover>
					<PopoverTrigger className="h-full bg-transparent hover:bg-neutral-700/40 aspect-square rounded-lg flex">
						<FaFilter className="text-neutral-600 m-auto" />
					</PopoverTrigger>
					<PopoverContent className="bg-neutral-700 mr-4 text-neutral-300 text-xl p-5 w-fit">
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
			</div>
		</div>
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
