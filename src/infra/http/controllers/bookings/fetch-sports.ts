import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeFetchSportsUseCase } from '@/domain/booking/application/use-cases/factories/make-fetch-sports-use-case';

export function fetchSportsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/sports',
		{
			schema: {
				summary: 'Fetch sports',
				tags: ['booking'],
				response: {
					200: z.object({
						sports: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
							}),
						),
					}),
				},
			},
		},
		async (_request, reply) => {
			const fetchSports = makeFetchSportsUseCase();

			const result = await fetchSports.execute();

			if (!result.value) {
				throw new Error();
			}

			reply.status(200).send({
				sports: result.value.sports.map((sport) => {
					return { id: sport.id.toString(), name: sport.name };
				}),
			});
		},
	);
}
