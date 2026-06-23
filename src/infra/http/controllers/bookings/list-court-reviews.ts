import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeListCourtReviewsUseCase } from '@/domain/booking/application/use-cases/factories/make-list-court-reviews-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';
import { parsePaginationQuery } from '../../utils/pagination-query';

const reviewWithAuthorSchema = z.object({
    author: z.object({
        name: z.string().nullable(),
        email:z.email(),
        avatarUrl: z.url().nullable()
    }),
    review: z.object({
        courtId: z.string(),
        comment: z.string(),
        rating: z.number(),
        createdAt: z.date()
    })
})

export function listCourtReviewsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/courts/:courtId/reviews',
		{
			schema: {
				summary: 'List court reviews',
				tags: ['booking'],
                querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				params: z.object({
					courtId: z.string(),
				}),
				response: {
					200: z.object({
                        data: z.array(reviewWithAuthorSchema),
                                            meta: z.object({
                                                page: z.number(),
                                                limit: z.number(),
                                                total: z.number(),
                                            }),
                                        }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
            const pagination = parsePaginationQuery(request.query);

            const listReviews = makeListCourtReviewsUseCase();

			const { courtId } = request.params;

			const result = await listReviews.execute({
				courtId,
                pagination
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
                data: result.value.reviewsList.data.map(({ author, review }) => {
                    return {
                        author,
                        review: {
                            courtId: review.courtId,
                            comment: review.comment,
                            rating: review.rating,
                            createdAt: review.createdAt
                        }
                    }
                }),
                meta: result.value.reviewsList.meta
            });
		},
	);
}
