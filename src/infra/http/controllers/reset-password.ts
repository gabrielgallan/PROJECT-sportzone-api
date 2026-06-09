import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InvalidTokenError } from '@/domain/identity/application/use-cases/errors/invalid-token-error';
import { makeResetPasswordUseCase } from '@/domain/identity/application/use-cases/factories/make-reset-password-use-case';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function resetPasswordController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().patch(
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
					204: z.null(),
					400: httpErrorSchema,
					404: httpErrorSchema,
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

			reply.status(204).send(null);
		},
	);
}
