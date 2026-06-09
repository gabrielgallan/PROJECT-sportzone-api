import ky, { HTTPError } from 'ky';
import { z } from 'zod';
import type { AuthProvider, UserProps } from '@/domain/identity/application/auth/auth-provider';
import { env } from '@/infra/env';
import { BadGatewayError } from '@/infra/http/errors/bad-gateway-error';
import { BadRequestError } from '@/infra/http/errors/bad-request-error';

interface GithubOAuthProviderInput {
	code: string;
}

type GithubUser = UserProps;

export class GithubOAuthProvider implements AuthProvider<GithubUser, GithubOAuthProviderInput> {
	async signIn({ code: OAuthCode }: GithubOAuthProviderInput) {
		const githubOAuthURL = new URL('https://github.com/login/oauth/access_token');

		githubOAuthURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
		githubOAuthURL.searchParams.set('client_secret', env.GITHUB_OAUTH_CLIENT_SECRET);
		githubOAuthURL.searchParams.set('redirect_uri', env.GITHUB_OAUTH_CLIENT_REDIRECT_URI);
		githubOAuthURL.searchParams.set('code', OAuthCode);

		try {
			const githubOAuthTokenResponse = await ky.post(githubOAuthURL).json();

			const OAuthResult = z
				.object({
					access_token: z.string(),
					token_type: z.literal('bearer'),
					scope: z.string(),
				})
				.safeParse(githubOAuthTokenResponse);

			if (!OAuthResult.success) {
				throw new BadGatewayError('Wrong data format returned from GitHub OAuth API');
			}

			const githubUserResponse = await ky
				.get('https://api.github.com/user', {
					headers: {
						Authorization: `Bearer ${OAuthResult.data.access_token}`,
					},
				})
				.json();

			const githubUserResult = z
				.object({
					id: z.number().int().transform(String),
					email: z.string().nullable(),
					name: z.string().nullable(),
					avatar_url: z.string().url(),
				})
				.safeParse(githubUserResponse);

			if (!githubUserResult.success) {
				throw new BadGatewayError('Wrong user data returned from GitHub API');
			}

			const { email, name, id: githubId, avatar_url: avatarUrl } = githubUserResult.data;

			if (!email) {
				throw new BadRequestError('Provide a e-mail in your github account to authenticate!');
			}

			return {
				id: githubId,
				email,
				name,
				avatarUrl,
			};
		} catch (err) {
			if (err instanceof HTTPError) {
				throw new BadGatewayError('Failed connect with GitHug OAuth API');
			}

			throw err;
		}
	}
}
