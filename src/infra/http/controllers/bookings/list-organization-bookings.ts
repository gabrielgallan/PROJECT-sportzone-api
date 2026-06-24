import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeListOrganizationBookingsUseCase } from '@/domain/booking/application/use-cases/factories/make-list-organization-bookings-use-case';
import { httpErrorSchema } from '../../errors/types/http-error';
import {
	OrganizationBookingPresenter,
	organizationBookingSchema,
} from '../../presenters/bookings/booking-presenter';
import { parsePaginationQuery } from '../../utils/pagination-query';

export function listOrganizationBookingsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/organizations/:organizationSlug/bookings',
		{
			schema: {
				summary: 'List organization bookings',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				params: z.object({
					organizationSlug: z.string(),
				}),
				response: {
					200: z.object({
						data: z.array(organizationBookingSchema),
						meta: z.object({
							page: z.number(),
							limit: z.number(),
							total: z.number(),
						}),
					}),
					400: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const pagination = parsePaginationQuery(request.query);
			const organization = await request.getOrganizationBySlug();

			const listOrganizationBookings = makeListOrganizationBookingsUseCase();

			const result = await listOrganizationBookings.execute({
				organizationId: organization.id,
				pagination,
			});

			if (result.isLeft()) {
				throw new Error();
			}

			reply.status(200).send({
				data: result.value.bookingsList.data.map(OrganizationBookingPresenter.toHTTP),
				meta: result.value.bookingsList.meta,
			});
		},
	);
}
