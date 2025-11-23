import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { Transaction } from '@/types/transactions';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

type TransactionState = {
	transactions: Transaction[];
	isLoading: boolean;
	buyTeam: (teamKey: string, isBuy: boolean | undefined, shares: number | undefined) => Promise<void>;
	sellTeam: (teamKey: string) => Promise<void>;
	loadTransactions: () => Promise<void>;
};

export const useTransactionStore = create<TransactionState>(set => {
	async function loadTransactions() {
		const user = useAuthStore.getState().user;
		const token = useAuthStore.getState().token;

		if (!user || !token) {
			throw new Error('User not signed in');
		}

		const response = await fetch(`${API_DOMAIN}/transactions/${user.id}/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to complete transaction');
		}

		const data = await response.json();
		set({ isLoading: false, transactions: data });
	}

	async function buyTeam(teamKey: string, isBuy = true, shares = 1) {
		const user = useAuthStore.getState().user;
		const token = useAuthStore.getState().token;

		if (!user || !token) {
			throw new Error('User not signed in');
		}

		const response = await fetch(
			`${API_DOMAIN}/transactions/${user.id}/buy/${teamKey}?action=${isBuy ? 'buy' : 'short'}&shares=${shares}`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to complete transaction');
		}

		const data = await response.json();
		set({ transactions: data });
	}

	async function sellTeam(teamKey: string) {
		const user = useAuthStore.getState().user;
		const token = useAuthStore.getState().token;

		if (!user || !token) {
			throw new Error('User not signed in');
		}

		const response = await fetch(`${API_DOMAIN}/transactions/${user.id}/sell/${teamKey}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to complete transaction');
		}

		const data = await response.json();
		set({ transactions: data });
	}

	return {
		transactions: [],
		isLoading: true,
		buyTeam,
		sellTeam,
		loadTransactions
	};
});
