import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { GithubOAuthProvider } from './providers/github-oauth-provider';
import { GoogleOAuthProvider } from './providers/google-oauth-provider';

const authPlugin = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook('preHandler', async (request, reply) => {
		request.getUserId = async () => {
			try {
				const { sub } = await request.jwtVerify<{ sub: string }>();

				return sub;
			} catch {
				return reply.status(401).send({ message: 'Invalid auth token' });
			}
		};
	});
});

const providers = {
	github: new GithubOAuthProvider(),
	google: new GoogleOAuthProvider(),
};

const plugins = {
	authPlugin,
};

export { plugins, providers };
