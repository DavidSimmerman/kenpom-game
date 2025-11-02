import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

interface User {
	id: string;
	email: string;
	username: string | null;
	picture: string | null;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	fetchUser: () => Promise<void>;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isLoading: false,
			isAuthenticated: false,

			setToken: (token: string) => {
				set({ token, isLoading: true });
				get().fetchUser();
			},

			fetchUser: async () => {
				const token = get().token;
				if (!token) {
					set({ user: null, isAuthenticated: false, isLoading: false });
					return;
				}

				try {
					const response = await fetch(`${API_DOMAIN}/auth/me`, {
						headers: {
							Authorization: `Bearer ${token}`
						}
					});

					if (!response.ok) {
						throw new Error('Failed to fetch user');
					}

					const data = await response.json();
					set({
						user: data.user,
						isAuthenticated: true,
						isLoading: false
					});
				} catch (error) {
					console.error('Error fetching user:', error);
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false
					});
				}
			},

			logout: () => {
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false
				});
			}
		}),
		{
			name: 'auth-storage',
			partialize: state => ({ token: state.token })
		}
	)
);

if (useAuthStore.getState().token) {
	useAuthStore.getState().fetchUser();
}
