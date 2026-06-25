import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeReviewCourtUseCase } from '@/domain/booking/application/use-cases/factories/make-review-court-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export function reviewCourtController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/courts/:courtId/reviews',
		{
			schema: {
				summary: 'Review court',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					courtId: z.string(),
				}),
				body: z.object({
					comment: z.string(),
					rating: z.number(),
				}),
				response: {
					201: z.null(),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const reviewCourt = makeReviewCourtUseCase();

			const { courtId } = request.params;

			const { comment, rating } = request.body;

			const result = await reviewCourt.execute({
				userId,
				courtId,
				comment,
				rating,
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
