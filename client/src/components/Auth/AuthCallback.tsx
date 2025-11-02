import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Spinner } from '../ui/spinner';

export default function AuthCallback() {
	const setToken = useAuthStore(s => s.setToken);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');
		const error = urlParams.get('error');

		// TODO: add error toast
		if (error) {
			console.error('Authentication error:', error);
			window.location.href = '/';
			return;
		}

		if (token) {
			setToken(token);
			window.location.href = '/';
		} else {
			window.location.href = '/';
		}
	}, [setToken]);

	return (
		<div className="flex flex-col gap-4 items-center justify-center h-screen bg-secondary">
			<div className="text-center">
				<div className="text-xl text-neutral-300">Completing sign in...</div>
			</div>
			<Spinner />
		</div>
	);
}
