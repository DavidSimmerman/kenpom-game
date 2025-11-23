import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import cron from 'node-cron';
import kenpomRoutes from './routes/kenpom.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import { saveKenpom } from './jobs/dailyKenpom.js';
import './config/passport.js';
import passport from 'passport';

dotenv.config();

cron.schedule('0 6 * * *', async () => {
	console.log('Starting downloading kenpom rankings');
	try {
		await saveKenpom();
		console.log('Completed downloading kenpom ranks');
	} catch (err: any) {
		console.error(err.message);
	}
});

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000');

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/auth', authRoutes);

app.use('/kenpom', kenpomRoutes);

app.use('/transactions', transactionRoutes);

app.get('/status', (_req, res) => {
	res.send('healthy');
});

app.get('/downloadkp', async (_req, res) => {
	res.send('complete');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Error:', err.message);
	console.error('Full error:', err);

	res.status(500).json({
		error: 'Internal Server Error',
		message: err.message
	});
});

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
});
