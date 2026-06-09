import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InvalidTokenError } from '@/domain/identity/application/use-cases/errors/invalid-token-error';
import { makeResetPasswordUseCase } from '@/domain/identity/application/use-cases/factories/make-reset-password-use-case';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

export function resetPasswordController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/password/reset',
		{
			schema: {
				summary: 'Reset password',
				tags: ['auth'],
				body: z.object({
					recoverCode: z.string(),
					password: z.string(),
				}),
				response: {
					200: z.null(),
					400: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { recoverCode, password } = request.body;

			const resetPassword = makeResetPasswordUseCase();

			const result = await resetPassword.execute({
				recoverCode,
				password,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case InvalidTokenError:
						throw new BadRequestError(error.message);

					default:
						throw error;
				}
			}

			reply.status(200).send(null);
		},
	);
}
