import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { services } from '../database';
import { BadRequestError } from '../http/errors/bad-request-error';
import { NotFoundError } from '../http/errors/not-found-error';
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

	app.addHook('preHandler', async (request, _reply) => {
		request.getOrganizationBySlug = async () => {
			const { organizationSlug } = request.params as { organizationSlug: string | undefined };

			if (!organizationSlug) {
				throw new BadRequestError('Organization slug is missing');
			}

			const organization = await services.prisma.organization.findUnique({
				where: {
					slug: organizationSlug,
				},
			});

			if (!organization) {
				throw new NotFoundError('Organization not found')
			}

			return organization;
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
