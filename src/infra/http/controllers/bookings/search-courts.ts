import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeSearchCourtsUseCase } from '@/domain/booking/application/use-cases/factories/make-search-courts-use-case';
import { httpErrorSchema } from '../../errors/types/http-error';
import { CourtWithCoverPresenter } from '../../presenters/bookings/court-presenter';
import { parsePaginationQuery } from '../../utils/pagination-query';

export const courtWithCoverSchema = z.object({
	courtId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	address: z.string(),
	coverUrl: z.url().nullable(),
	pricePerHour: z.number(),
	rating: z.number(),
});

export function searchCourtsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/courts',
		{
			schema: {
				summary: 'Search court',
				tags: ['booking'],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
					courtName: z.string().optional(),
					courtAddress: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(courtWithCoverSchema),
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

			const { courtName, courtAddress } = request.query;

			const searchCourts = makeSearchCourtsUseCase();

			const result = await searchCourts.execute({
				courtName,
				courtAddress,
				pagination,
			});

			if (result.isLeft()) {
				throw new Error();
			}

			reply.status(200).send({
				data: result.value.courtsList.data.map(CourtWithCoverPresenter.toHTTP),
				meta: result.value.courtsList.meta,
			});
		},
	);
}
