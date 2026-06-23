import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeGetCourtAvaliableSlotsUseCase } from '@/domain/booking/application/use-cases/factories/make-get-court-avaliable-slots-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export const timeSlotSchema = z.object({
	time: z.string(),
	available: z.boolean(),
});

export function getCourtAvailableTimeSlotsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/courts/:courtId/time-slots/:date',
		{
			schema: {
				summary: 'Get court time slots',
				tags: ['booking'],
				params: z.object({
					courtId: z.string(),
					date: z.string(),
				}),
				response: {
					200: z.object({ timeSlots: z.array(timeSlotSchema) }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const getCourtTimeSlots = makeGetCourtAvaliableSlotsUseCase();

			const { courtId, date } = request.params;

			const result = await getCourtTimeSlots.execute({
				courtId,
				date,
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
				timeSlots: result.value.timeSlots,
			});
		},
	);
}
