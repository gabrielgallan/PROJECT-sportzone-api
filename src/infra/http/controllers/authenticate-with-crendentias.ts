import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { InvalidCredentialsError } from '@/domain/identity/application/use-cases/errors/invalid-credentials-error';
import { makeAuthenticateUseCase } from '@/domain/identity/application/use-cases/factories/make-authenticate-use-case';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function authenticateWithCredentialsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/sessions',
		{
			schema: {
				summary: 'Authenticate',
				tags: ['auth'],
				body: z.object({
					email: z.email(),
					password: z.string(),
				}),
				response: {
					201: z.object({ token: z.string() }),
					401: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const authenticate = makeAuthenticateUseCase(app);

			const result = await authenticate.execute({
				email,
				password,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case InvalidCredentialsError:
						throw new UnauthorizedError(error.message);

					default:
						throw error;
				}
			}

			reply.status(201).send(result.value);
		},
	);
}
