import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { makeRequestPasswordRecoverUseCase } from '@/domain/identity/application/use-cases/factories/make-request-password-recover-use-case';
import { NotFoundError } from '../errors/not-found-error';

export function requestPasswordRecoverController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/password/recover',
		{
			schema: {
				summary: 'Request password recover',
				tags: ['auth'],
				body: z.object({
					email: z.email(),
				}),
				response: {
					201: z.null(),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { email } = request.body;

			const requestPasswordRecover = makeRequestPasswordRecoverUseCase();

			const result = await requestPasswordRecover.execute({
				email,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					default:
						throw error;
				}
			}

			reply.status(201).send(null);
		},
	);
}
