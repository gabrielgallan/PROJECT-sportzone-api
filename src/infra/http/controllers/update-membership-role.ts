import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { InvalidMembershipRoleError } from '@/domain/identity/application/use-cases/errors/invalid-membership-role-error';
import { makeUpdateMembershipRoleUseCase } from '@/domain/identity/application/use-cases/factories/make-update-membership-role-use-case';
import { BadRequestError } from '../errors/bad-request-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function updateMembershipRoleController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().patch(
		'/organizations/:organizationSlug/members/:memberId/role',
		{
			schema: {
				summary: 'Update member role',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					organizationSlug: z.string(),
					memberId: z.string(),
				}),
				body: z.object({
					role: z.union([z.literal('MEMBER'), z.literal('BILLING')]),
				}),
				response: {
					204: z.null(),
					400: httpErrorSchema,
					403: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();
			const { organizationSlug, memberId } = request.params;
			const { role } = request.body;

			const updateMembershipRole = makeUpdateMembershipRoleUseCase();

			const result = await updateMembershipRole.execute({
				userId,
				organizationSlug,
				memberId,
				role,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case InsufficientPermissionsError:
						throw new ForbiddenError(error.message);

					case InvalidMembershipRoleError:
						throw new BadRequestError(error.message);

					default:
						throw error;
				}
			}

			reply.status(204).send(null);
		},
	);
}
