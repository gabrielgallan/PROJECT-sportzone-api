import ky, { HTTPError } from 'ky';
import { ZodError, z } from 'zod';
import type { AuthProvider, UserProps } from '@/domain/identity/application/auth/auth-provider';
import { env } from '@/infra/env';
import { BadGatewayError } from '@/infra/http/errors/bad-gateway-error';

interface GoogleOAuthProviderInput {
	code: string;
}

type GoogleUser = UserProps;

const googleTokenResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number(),
	id_token: z.string().optional(),
	scope: z.string().optional(),
});

const googleUserResponseSchema = z.object({
	sub: z.string(),
	email: z.string().email(),
	email_verified: z.boolean(),
	name: z.string(),
	picture: z.string().url().optional(),
});

export class GoogleOAuthProvider implements AuthProvider<GoogleUser, GoogleOAuthProviderInput> {
	async signIn({ code }: GoogleOAuthProviderInput) {
		try {
			const tokenResponse = await ky
				.post('https://oauth2.googleapis.com/token', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						code,
						client_id: env.GITHUB_OAUTH_CLIENT_ID,
						client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
						redirect_uri: env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
						grant_type: 'authorization_code',
					}),
				})
				.json();

			const { access_token } = googleTokenResponseSchema.parse(tokenResponse);

			const userResponse = await ky
				.get('https://openidconnect.googleapis.com/v1/userinfo', {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				})
				.json();

			const {
				sub: id,
				email,
				name,
				picture: avatarUrl,
			} = googleUserResponseSchema.parse(userResponse);

			return {
				id,
				email,
				name,
				avatarUrl: avatarUrl || null,
			};
		} catch (err) {
			if (err instanceof HTTPError) {
				throw new BadGatewayError('Failed connect with Google OAuth API');
			}

			if (err instanceof ZodError) {
				throw new BadGatewayError('Wrong data format returned from Google OAuth API');
			}

			throw err;
		}
	}
}
