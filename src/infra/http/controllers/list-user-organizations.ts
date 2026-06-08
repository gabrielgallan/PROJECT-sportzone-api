import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { makeListUserOrganizationsUseCase } from '@/domain/identity/application/use-cases/factories/make-list-user-organizations-use-case';
import { OrganizationWithRolePresenter } from '../presenters/identity/organization-presenter';

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
				params: z.object({
					page: z.coerce.number().optional(),
					limit: z.coerce.number().optional()
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
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const pagination = await request.getPaginationQuery()

			const listOrganizations = makeListUserOrganizationsUseCase();

			const result = await listOrganizations.execute({
				userId,
				pagination
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						return reply.status(404).send({ message: error.message });

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
