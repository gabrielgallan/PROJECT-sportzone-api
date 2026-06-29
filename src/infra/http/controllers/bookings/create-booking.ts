import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeCreateBookingUseCase } from '@/domain/booking/application/use-cases/factories/make-create-booking-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export function createBookingController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/courts/:courtId/bookings',
		{
			schema: {
				summary: 'Create booking',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				body: z
					.object({
						startDate: z.coerce.date(),
						endDate: z.coerce.date(),
					})
					.refine((data) => data.endDate > data.startDate, {
						message: 'endDate must be after startDate',
						path: ['endDate'],
					}),
				params: z.object({
					courtId: z.string(),
				}),
				response: {
					201: z.null(),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const { courtId } = request.params;

			const { startDate, endDate } = request.body;

			const createBooking = makeCreateBookingUseCase();

			const result = await createBooking.execute({
				userId,
				courtId,
				startDate,
				endDate,
			});

			if (result.isLeft()) {
				// TODO: trate all errors returned

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
