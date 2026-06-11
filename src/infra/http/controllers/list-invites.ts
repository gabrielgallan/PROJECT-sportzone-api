import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeListInvitesUseCase } from '@/domain/identity/application/use-cases/factories/make-list-invites-use-case';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';
import { parsePaginationQuery } from '../utils/pagination-query';

const inviteSchema = z.object({
	id: z.string(),
	organization: z.object({
		name: z.string(),
		avatarUrl: z.string().nullable(),
		authorName: z.string().nullable(),
	}),
	role: z.enum(['MEMBER', 'BILLING', 'OWNER']),
	status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']),
	createdAt: z.date(),
});

export function listInvitesController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/invites',
		{
			schema: {
				summary: 'List invites',
				tags: ['invites'],
				security: [{ bearerAuth: [] }],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(inviteSchema),
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

			const listInvites = makeListInvitesUseCase();

			const result = await listInvites.execute({
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

			reply.status(200).send({
				data: result.value.invites.data.map((invite) => {
					return {
						id: invite.inviteId,
						organization: invite.organization,
						role: invite.role,
						status: invite.status,
						createdAt: invite.createdAt,
					};
				}),
				meta: result.value.invites.meta,
			});
		},
	);
}
