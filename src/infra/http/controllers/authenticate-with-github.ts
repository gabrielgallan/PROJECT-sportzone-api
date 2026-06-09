import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeAuthenticateWithGithubUseCase } from '@/domain/identity/application/use-cases/factories/make-authenticate-with-github';
import { httpErrorSchema } from '../errors/types/http-error';

export function authenticateWithGithubController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/sessions/github',
		{
			schema: {
				summary: 'Authenticate with GitHub',
				tags: ['auth'],
				body: z.object({
					code: z.string(),
				}),
				response: {
					201: z.object({ token: z.string() }),
					502: httpErrorSchema
				},
			},
		},
		async (request, reply) => {
			const { code } = request.body;

			const authenticateWithGithub = makeAuthenticateWithGithubUseCase(app);

			const { token } = await authenticateWithGithub.execute({
				provider: 'GITHUB',
				code,
			});

			reply.status(201).send({ token });
		},
	);
}
