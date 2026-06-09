import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeAuthenticateWithGoogleUseCase } from '@/domain/identity/application/use-cases/factories/make-authenticate-with-google';

export function authenticateWithGoogleController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/sessions/google',
		{
			schema: {
				summary: 'Authenticate with Google',
				tags: ['auth'],
				body: z.object({
					code: z.string(),
				}),
				response: {
					200: z.object({ token: z.string() }),
					401: z.object({ message: z.string() }),
					502: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { code } = request.body;

			const authenticateWithGoogle = makeAuthenticateWithGoogleUseCase(app);

			const { token } = await authenticateWithGoogle.execute({
				provider: 'GOOGLE',
				code,
			});

			reply.status(200).send({ token });
		},
	);
}
