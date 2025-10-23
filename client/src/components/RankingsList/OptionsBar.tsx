import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import { OptionsBarProps } from './types';
import { FaFilter } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function OptionsBar({ conferences, value, onChange }: OptionsBarProps) {
	return (
		<div className="bg-secondary pt-2 z-10 flex ">
			<div className="flex ml-4">
				<IoSearch className="text-neutral-600 my-auto mr-4" size={20} />
				<Input
					className="w-[400px] bg-neutral-900 border-neutral-600"
					placeholder="Search Team"
					value={value}
					onChange={e => onChange(e.target.value)}
				/>
			</div>
			<div className="ml-auto mr-4">
				<Popover>
					<PopoverTrigger>
						<Button className="h-full bg-transparent hover:bg-neutral-700/40 ">
							<FaFilter className="text-neutral-600" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="bg-neutral-700 mr-4">
						<div>Conferences:</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
