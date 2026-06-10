import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { OrganizationAlreadyExistsError } from '@/domain/identity/application/use-cases/errors/organization-already-exists-error';
import { makeCreateOrganizationUseCase } from '@/domain/identity/application/use-cases/factories/make-create-organization-use-case';
import { ConflictError } from '../errors/conflict-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function createOrganizationController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/organizations',
		{
			schema: {
				summary: 'Create organization',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				body: z.object({
					name: z.string(),
					avatarUrl: z.string().nullable(),
				}),
				response: {
					201: z.null(),
					404: httpErrorSchema,
					409: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const { name, avatarUrl } = request.body;

			const createOrganization = makeCreateOrganizationUseCase();

			const result = await createOrganization.execute({
				userId,
				name,
				avatarUrl,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case OrganizationAlreadyExistsError:
						throw new ConflictError(error.message);

					default:
						throw error;
				}
			}

			reply.status(201).send(null);
		},
	);
}
