import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Spinner } from '../ui/spinner';

export default function AuthCallback() {
	const setToken = useAuthStore(s => s.setToken);
	const navigate = useNavigate();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');
		const error = urlParams.get('error');

		// TODO: add error toast
		if (error) {
			console.error('Authentication error:', error);
			navigate('/');
			return;
		}

		if (token) {
			setToken(token);
			navigate('/');
		} else {
			navigate('/');
		}
	}, [setToken, navigate]);

	return (
		<div className="flex flex-col gap-4 items-center justify-center h-screen bg-secondary">
			<div className="text-center">
				<div className="text-xl text-neutral-300">Completing sign in...</div>
			</div>
			<Spinner />
		</div>
	);
}
