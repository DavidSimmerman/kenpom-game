import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findUser, createUser } from '../services/userService.js';
import { UserInfo } from '../types/User.js';

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: process.env.CALLBACK_URL!
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				console.log('Google profile received:', profile.id, profile.emails?.[0]?.value);

				let user = await findUser({ googleId: profile.id });

				if (user) {
					console.log('Existing user found:', user.id);
					return done(null, user);
				}

				console.log('Creating new user...');
				user = await createUser(profile);
				console.log('New user created:', user.id);

				return done(null, user);
			} catch (error) {
				console.error('Error in Google Strategy:', error);
				return done(error as Error, undefined);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, (user as UserInfo).id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await findUser({ id });
		done(null, user);
	} catch (error) {
		done(error as Error, null);
	}
});

export default passport;
