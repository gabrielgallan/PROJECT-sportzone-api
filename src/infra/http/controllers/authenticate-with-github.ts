import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeAuthenticateWithGithubUseCase } from '@/domain/identity/application/use-cases/factories/make-authenticate-with-github';

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
					200: z.object({ token: z.string() }),
					401: z.object({ message: z.string() }),
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

			reply.status(200).send({ token });
		},
	);
}
