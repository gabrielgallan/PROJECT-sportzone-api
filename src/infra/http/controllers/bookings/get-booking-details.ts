import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeGetBookingDetailsUseCase } from '@/domain/booking/application/use-cases/factories/make-get-booking-details-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';
import {
	BookingWithCourtPresenter,
	bookingWithCourtSchema,
} from '../../presenters/bookings/booking-presenter';

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

export function getBookingDetailsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/bookings/:bookingId',
		{
			schema: {
				summary: 'Get booking details',
				tags: ['booking'],
				params: z.object({
					bookingId: z.string(),
				}),
				response: {
					200: z.object({ booking: bookingWithCourtSchema }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const getBooking = makeGetBookingDetailsUseCase();

			const { bookingId } = request.params;

			const result = await getBooking.execute({
				bookingId,
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

			reply.status(200).send({ booking: BookingWithCourtPresenter.toHTTP(result.value.booking) });
		},
	);
}
