import { GoogleProfile, UserInfo } from '../types/User.js';
import { PostgresService } from './dbService.js';

const db = PostgresService.getInstance();

export async function findUser(criteria: { id?: string; googleId?: string; email?: string }): Promise<UserInfo | null> {
	let query: string;
	let params: any[];

	if (criteria.id) {
		query = 'SELECT * FROM users WHERE id = $1';
		params = [criteria.id];
	} else if (criteria.googleId) {
		query = 'SELECT * FROM users WHERE google_id = $1';
		params = [criteria.googleId];
	} else if (criteria.email) {
		query = 'SELECT * FROM users WHERE email = $1';
		params = [criteria.email];
	} else {
		throw new Error('At least one search criterion must be provided');
	}

	const rows = await db.query<UserInfo>(query, params);
	return rows[0] || null;
}

export async function createUser(profile: GoogleProfile): Promise<UserInfo> {
	if (!profile.emails || profile.emails.length === 0) {
		throw new Error('User email is required');
	}

	const rows = await db.query<UserInfo>(
		`INSERT INTO users (google_id, email, username, picture)
     	VALUES ($1, $2, $3, $4)
     	RETURNING *`,
		[profile.id, profile.emails[0].value, profile.displayName, profile.photos?.[0]?.value || null]
	);
	return rows[0];
}

export async function updateUser(id: string, updates: { username?: string; picture?: string }): Promise<UserInfo> {
	const rows = await db.query<UserInfo>(
		`UPDATE users
     	SET username = COALESCE($1, username),
			picture = COALESCE($2, picture),
        	updated_at = CURRENT_TIMESTAMP
     	WHERE id = $3
     	RETURNING *`,
		[updates.username, updates.picture, id]
	);
	return rows[0];
}

export async function deleteUser(id: string): Promise<void> {
	await db.query('DELETE FROM users WHERE id = $1', [id]);
}
