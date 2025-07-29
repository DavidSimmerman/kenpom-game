import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import kenpomRoutes from '@routes/kenpom.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000');

app.use(express.json());
app.use('/kenpom', kenpomRoutes);

app.get('/status', (req, res) => {
	res.send('healthy');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Error:', err.message);

	res.status(500).json({
		error: 'Internal Server Error',
		message: err.message
	});
});

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
});
