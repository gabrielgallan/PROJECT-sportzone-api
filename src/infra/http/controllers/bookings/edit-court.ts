import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeEditCourtUseCase } from '@/domain/booking/application/use-cases/factories/make-edit-court-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export function editCourtController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().put(
		'/organizations/:organizationSlug/courts/:courtId',
		{
			schema: {
				summary: 'Edit court',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				body: z.object({
					name: z.string(),
					description: z.string().optional(),
					imagesIds: z.array(z.string()),
					opensAtInMinutes: z.number(),
					closesAtInMinutes: z.number(),
					weekDays: z.array(z.number()),
				}),
				params: z.object({
					organizationSlug: z.string(),
					courtId: z.uuid(),
				}),
				response: {
					204: z.null(),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const { courtId } = request.params;

			const { name, description, imagesIds, opensAtInMinutes, closesAtInMinutes, weekDays } =
				request.body;

			const editCourt = makeEditCourtUseCase();

			const result = await editCourt.execute({
				courtId,
				name,
				description,
				imagesIds,
				opensAtInMinutes,
				closesAtInMinutes,
				weekDays,
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

			reply.status(204).send(null);
		},
	);
}
