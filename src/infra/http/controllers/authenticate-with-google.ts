import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeAuthenticateWithGoogleUseCase } from '@/domain/identity/application/use-cases/factories/make-authenticate-with-google';
import { httpErrorSchema } from '../errors/types/http-error';

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
					201: z.object({ token: z.string() }),
					502: httpErrorSchema,
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

			reply.status(201).send({ token });
		},
	);
}
