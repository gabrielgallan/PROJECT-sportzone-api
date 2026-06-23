import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeReviewCourtUseCase } from '@/domain/booking/application/use-cases/factories/make-review-court-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';
import { CourtDetailsPresenter } from '../../presenters/bookings/court-presenter';

export const courtDetailsSchema = z.object({
	courtId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	address: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	images: z.array(z.string()),
	pricePerHour: z.number(),
	rating: z.number(),
	reviewsCount: z.number(),
});

export function reviewCourtController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/courts/:courtId/reviews',
		{
			schema: {
				summary: 'Review court',
				tags: ['booking'],
				params: z.object({
					courtId: z.string(),
				}),
                body: z.object({
                    comment: z.string().min(3),
                    rating: z.number().int().min(1).max(5)
                }),
				response: {
					200: z.object({ review: z.object({ comment: z.string() }) }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
            const userId = await request.getUserId()

			const reviewCourt = makeReviewCourtUseCase();

			const { courtId } = request.params;

            const { comment, rating } = request.body

			const result = await reviewCourt.execute({
                userId,
				courtId,
                comment,
                rating
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
				court: CourtDetailsPresenter.toHTTP(result.value.court),
			});
		},
	);
}
