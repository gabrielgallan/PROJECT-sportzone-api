import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeCreateCourtUseCase } from '@/domain/booking/application/use-cases/factories/make-create-court-use-case';
import { NotFoundError } from '../../errors/not-found-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export function createCourtController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/organizations/:organizationSlug/courts',
		{
			schema: {
				summary: 'Create court',
				tags: ['booking'],
				security: [{ bearerAuth: [] }],
				body: z.object({
					name: z.string(),
					description: z.string().optional(),
					address: z.string(),
					latitude: z.number(),
					longitude: z.number(),
					opensAtInMinutes: z.number(),
					closesAtInMinutes: z.number(),
					coverImageId: z.string(),
					imagesIds: z.array(z.string()),
					pricePerHour: z.number(),
					weekDays: z.array(z.number()),
				}),
				params: z.object({
					organizationSlug: z.string(),
				}),
				response: {
					201: z.null(),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const organization = await request.getOrganizationBySlug();

			const {
				name,
				address,
				description,
				latitude,
				longitude,
				opensAtInMinutes,
				closesAtInMinutes,
				imagesIds,
				coverImageId,
				pricePerHour,
				weekDays,
			} = request.body;

			const createCourt = makeCreateCourtUseCase();

			const result = await createCourt.execute({
				organizationId: organization.id,
				name,
				description,
				address,
				latitude,
				longitude,
				opensAtInMinutes,
				closesAtInMinutes,
				coverImageId,
				imagesIds,
				pricePerHour,
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

			reply.status(201).send(null);
		},
	);
}
