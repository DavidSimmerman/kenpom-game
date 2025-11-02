import express, { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { UserInfo } from '../types/User.js';

const router = express.Router();

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		session: false
	})
);

router.get(
	'/google/callback',
	passport.authenticate('google', {
		session: false,
		failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
	}),
	(req: Request, res: Response) => {
		try {
			const user = req.user as UserInfo;

			const token = jwt.sign(
				{
					id: user.id,
					email: user.email
				},
				process.env.JWT_SECRET!,
				{ expiresIn: '7d' }
			);

			res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
		} catch (error) {
			console.error('Error generating token:', error);
			res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
		}
	}
);

router.get('/me', authenticateToken, (req: Request, res: Response) => {
	res.json({
		user: {
			id: req.user!.id,
			email: req.user!.email,
			username: req.user!.username,
			picture: req.user!.picture
		}
	});
});

router.get('/verify', authenticateToken, (req: Request, res: Response) => {
	res.json({
		valid: true,
		user: { id: req.user!.id, email: req.user!.email }
	});
});

export default router;
