import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeListOrganizationCourtsUseCase } from '@/domain/booking/application/use-cases/factories/make-list-organization-courts-use-case';
import { httpErrorSchema } from '../../errors/types/http-error';
import { CourtWithCoverPresenter } from '../../presenters/bookings/court-presenter';
import { parsePaginationQuery } from '../../utils/pagination-query';
import { courtWithCoverSchema } from './search-courts';

export function listOrganizationCourtsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/organizations/:organizationSlug/courts',
		{
			schema: {
				summary: 'List org courts',
				tags: ['booking'],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				params: z.object({
					organizationSlug: z.string(),
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
			const organization = await request.getOrganizationBySlug();

			const listOrgCourts = makeListOrganizationCourtsUseCase();

			const result = await listOrgCourts.execute({
				organizationId: organization.id,
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
