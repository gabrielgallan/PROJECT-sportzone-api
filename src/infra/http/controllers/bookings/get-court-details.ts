import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeGetCourtDetailsUseCase } from '@/domain/booking/application/use-cases/factories/make-get-court-details-use-case';
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

export function getCourtDetailsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/courts/:courtId',
		{
			schema: {
				summary: 'Get court details',
				tags: ['booking'],
				params: z.object({
					courtId: z.string(),
				}),
				response: {
					200: z.object({ court: courtDetailsSchema }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const getCourt = makeGetCourtDetailsUseCase();

			const { courtId } = request.params;

			const result = await getCourt.execute({
				courtId,
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
