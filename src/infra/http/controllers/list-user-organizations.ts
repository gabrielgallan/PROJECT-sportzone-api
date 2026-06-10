import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeListUserOrganizationsUseCase } from '@/domain/identity/application/use-cases/factories/make-list-user-organizations-use-case';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';
import { OrganizationWithRolePresenter } from '../presenters/identity/organization-presenter';
import { parsePaginationQuery } from '../utils/pagination-query';

const organizationWithRoleSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	avatarUrl: z.string().nullable(),
	role: z.enum(['MEMBER', 'OWNER', 'BILLING']),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export function listOrganizationsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/organizations',
		{
			schema: {
				summary: 'List user organizations',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(organizationWithRoleSchema),
						meta: z.object({
							page: z.number(),
							limit: z.number(),
							total: z.number(),
						}),
					}),
					400: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const pagination = parsePaginationQuery(request.query);

			const listOrganizations = makeListUserOrganizationsUseCase();

			const result = await listOrganizations.execute({
				userId,
				pagination,
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

			const organizations = result.value.organizations.data.map(
				OrganizationWithRolePresenter.toHTTP,
			);

			reply.status(200).send({
				data: organizations,
				meta: result.value.organizations.meta,
			});
		},
	);
}
