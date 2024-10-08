import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

export type ExtendedJwt = JWT & {
	accessToken?: string;
	refreshToken?: string;
	accessTokenExpires?: number;
	user?: User;
	userIdEncryptionHeader: string;
};

export type ExtendedSession = Session & {
	accessToken?: string;
	userIdEncryptionHeader: string;
};
