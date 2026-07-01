import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeSearchNearbyCourtsUseCase } from '@/domain/booking/application/use-cases/factories/make-search-nearby-courts-use-case';
import { httpErrorSchema } from '../../errors/types/http-error';
import { CourtWithCoverPresenter } from '../../presenters/bookings/court-presenter';
import { parsePaginationQuery } from '../../utils/pagination-query';
import { courtWithCoverSchema } from './search-courts';

export function searchNearbyCourtsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/courts/nearby',
		{
			schema: {
				summary: 'Search court by location',
				tags: ['booking'],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
					latitude: z.string(),
					longitude: z.string(),
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

			const { latitude, longitude } = request.query;

			const searchCourts = makeSearchNearbyCourtsUseCase();

			const result = await searchCourts.execute({
				userLatitude: Number(latitude),
				userLongitude: Number(longitude),
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
