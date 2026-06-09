import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { makeGetProfileUseCase } from '@/domain/booking/application/use-cases/factories/make-get-profile-use-case';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function getProfileController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/profile',
		{
			schema: {
				summary: 'Get user profile',
				tags: ['profile'],
				security: [{ bearerAuth: [] }],
				response: {
					200: z.object({
						user: z.object({
							email: z.string(),
							name: z.string().nullable(),
							avatarUrl: z.string().nullable(),
						}),
					}),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const getProfile = makeGetProfileUseCase();

			const result = await getProfile.execute({
				userId,
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

			reply.status(200).send({
				user: {
					name: result.value.user.name ?? null,
					email: result.value.user.email,
					avatarUrl: result.value.user.avatarUrl ?? null,
				},
			});
		},
	);
}
