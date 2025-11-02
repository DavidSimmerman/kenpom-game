export interface UserInfo {
	id: string;
	google_id: string;
	email: string;
	username: string | null;
	picture: string | null;
}

export interface GoogleProfile {
	id: string;
	displayName: string;
	emails: Array<{ value: string; verified?: boolean }>;
	photos?: Array<{ value: string }>;
}
