import { Request, Response } from 'express';
import { BadRequestError } from 'src/errors/Errors.js';
import { getTransactions as getTransactionsDb, saveTransaction } from 'src/services/transactionService.js';

export async function getTransactions(req: Request, res: Response) {
	const userId = req.user!.id;

	try {
		const transactions = await getTransactionsDb(userId);

		res.json(transactions);
	} catch (error: any) {
		if (error instanceof BadRequestError) {
			return res.status(400).json({ error: error.message });
		}

		console.error('Error fetching user transactions:', error.message);
		res.status(500).json({ error: 'Failed fetching user transactions.' });
	}
}

export async function buyTeam(req: Request, res: Response) {
	const userId = req.user!.id;
	const teamKey = req.params.teamKey;

	try {
		await saveTransaction(userId, teamKey, {
			action: req.query.action === 'short' ? 'short' : 'buy',
			shares: parseInt((req.query.shares as string) || '1')
		});

		res.json(await getTransactionsDb(userId));
	} catch (error: any) {
		if (error instanceof BadRequestError) {
			return res.status(400).json({ error: error.message });
		}

		console.error('Error saving transaction:', error.message);
		res.status(500).json({ error: 'Failed to save transaction.' });
	}
}

export async function sellTeam(req: Request, res: Response) {
	const userId = req.user!.id;
	const teamKey = req.params.teamKey;

	try {
		await saveTransaction(userId, teamKey, {
			action: 'sell'
		});

		res.json(await getTransactionsDb(userId));
	} catch (error: any) {
		if (error instanceof BadRequestError) {
			return res.status(400).json({ error: error.message });
		}

		console.error('Error saving transaction:', error.message);
		res.status(500).json({ error: 'Failed to save transaction.' });
	}
}
