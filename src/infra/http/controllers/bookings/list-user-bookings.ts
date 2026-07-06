import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeListUserBookingsUseCase } from '@/domain/booking/application/use-cases/factories/make-list-user-bookings-use-case';
import { BadRequestError } from '../../errors/bad-request-error';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';
import {
	BookingWithCourtPresenter,
	bookingWithCourtSchema,
} from '../../presenters/bookings/booking-presenter';
import { parsePaginationQuery } from '../../utils/pagination-query';

export function listUserBookingsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/bookings',
		{
			schema: {
				summary: 'List user booking',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
					dateFrom: z.coerce.date().optional(),
					dateTo: z.coerce.date().optional(),
					status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
				}),
				response: {
					200: z.object({
						data: z.array(bookingWithCourtSchema),
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
			const userId = await request.getUserId();
			const pagination = parsePaginationQuery(request.query);
			const { dateFrom, dateTo, status } = request.query;

			if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
				throw new BadRequestError('Invalid date range query');
			}

			const listUserBookings = makeListUserBookingsUseCase();

			const result = await listUserBookings.execute({
				userId,
				dateRange:
					dateFrom && dateTo
						? {
								from: dateFrom,
								to: dateTo,
							}
						: undefined,
				status,
				pagination,
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
				data: result.value.bookingsList.data.map(BookingWithCourtPresenter.toHTTP),
				meta: result.value.bookingsList.meta,
			});
		},
	);
}
