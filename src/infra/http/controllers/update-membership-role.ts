import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { InvalidMembershipRoleError } from '@/domain/identity/application/use-cases/errors/invalid-membership-role-error';
import { makeUpdateMembershipRoleUseCase } from '@/domain/identity/application/use-cases/factories/make-update-membership-role-use-case';
import { BadRequestError } from '../errors/bad-request-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';

export function updateMembershipRoleController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().put(
		'/organizations/:organizationSlug/members/:memberId',
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
					role: z.enum(['MEMBER', 'OWNER', 'BILLING']),
				}),
				response: {
					200: z.null(),
					400: z.object({ message: z.string() }),
					403: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
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

			reply.status(200).send(null);
		},
	);
}
