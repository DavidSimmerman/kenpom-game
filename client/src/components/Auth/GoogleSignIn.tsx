import { Button } from '../ui/button';
import { FcGoogle } from 'react-icons/fc';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

export default function GoogleSignIn() {
	const handleSignIn = () => {
		window.location.href = `${API_DOMAIN}/auth/google`;
	};

	return (
		<Button
			onClick={handleSignIn}
			className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 h-10 border border-gray-400 rounded shadow flex gap-2 items-center text-sm"
		>
			<FcGoogle size={18} />
			Sign in
		</Button>
	);
}
