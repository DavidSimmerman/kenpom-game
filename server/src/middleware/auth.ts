import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUser } from '../services/userService.js';
import { UserInfo } from '../types/User.js';

declare global {
	namespace Express {
		interface Request {
			user?: UserInfo;
		}
	}
}

interface JwtPayload {
	id: string;
	email: string;
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			res.status(401).json({ error: 'Access token required' });
			return;
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

		const user = await findUser({ id: decoded.id });

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(403).json({ error: 'Invalid or expired token' });
			return;
		}
		console.error('Auth middleware error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}
