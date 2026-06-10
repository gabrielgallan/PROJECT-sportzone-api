import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';

import { OrganizationAlreadyExistsError } from '@/domain/identity/application/use-cases/errors/organization-already-exists-error';
import { makeUpdateOrganizationProfileUseCase } from '@/domain/identity/application/use-cases/factories/make-update-organization-profile-use-case';
import { ConflictError } from '../errors/conflict-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function updateOrganizationProfileController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().put(
		'/organizations/:organizationSlug',
		{
			schema: {
				summary: 'Update organization',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					organizationSlug: z.string(),
				}),
				body: z.object({
					name: z.string().optional(),
				}),
				response: {
					204: z.null(),
					400: httpErrorSchema,
					403: httpErrorSchema,
					404: httpErrorSchema,
					409: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const { organizationSlug } = request.params;
			const { name } = request.body;

			const updateOrganizationProfile = makeUpdateOrganizationProfileUseCase();

			const result = await updateOrganizationProfile.execute({
				userId,
				organizationSlug,
				name,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case InsufficientPermissionsError:
						throw new ForbiddenError(error.message);

					case OrganizationAlreadyExistsError:
						throw new ConflictError(error.message);

					default:
						throw error;
				}
			}

			reply.status(204).send(null);
		},
	);
}
