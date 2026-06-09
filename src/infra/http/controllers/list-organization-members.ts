import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { makeListOrganizationMembersUseCase } from '@/domain/identity/application/use-cases/factories/make-list-organization-members-use-case';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { parsePaginationQuery } from '../utils/pagination-query';
import { httpErrorSchema } from '../errors/types/http-error';

const memberWithProfileSchema = z.object({
	user: z.object({
		id: z.string(),
		name: z.string().nullable(),
		email: z.string(),
		avatarUrl: z.string().nullable(),
	}),
	membership: z.object({
		role: z.enum(['MEMBER', 'OWNER', 'BILLING']),
		createdAt: z.date(),
	}),
});

export function listOrganizationMembersController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/organizations/:organizationSlug/members',
		{
			schema: {
				summary: 'List organization members',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					organizationSlug: z.string(),
				}),
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(memberWithProfileSchema),
						meta: z.object({
							page: z.number(),
							limit: z.number(),
							total: z.number(),
						}),
					}),
					400: httpErrorSchema,
					403: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();
			const { organizationSlug } = request.params;
			const pagination = parsePaginationQuery(request.query);

			const listOrganizationMembers = makeListOrganizationMembersUseCase();

			const result = await listOrganizationMembers.execute({
				userId,
				organizationSlug,
				pagination,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case InsufficientPermissionsError:
						throw new ForbiddenError(error.message);

					default:
						throw error;
				}
			}

			reply.status(200).send({
				data: result.value.members.data.map((member) => ({
					user: {
						id: member.user.id,
						name: member.user.name ?? null,
						email: member.user.email,
						avatarUrl: member.user.avatarUrl ?? null,
					},
					membership: {
						role: member.membership.role,
						createdAt: member.membership.createdAt,
					},
				})),
				meta: result.value.members.meta,
			});
		},
	);
}
