import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { makeListInvitesUseCase } from '@/domain/identity/application/use-cases/factories/make-list-invites-use-case';
import { NotFoundError } from '../errors/not-found-error';
import { parsePaginationQuery } from '../utils/pagination-query';

const inviteSchema = z.object({
	id: z.string(),
	email: z.string(),
	role: z.enum(['MEMBER', 'OWNER', 'BILLING']),
	status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']),
	createdAt: z.date(),
});

export function listInvitesController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/invites',
		{
			schema: {
				summary: 'List invites',
				tags: ['auth'],
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
					400: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
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
				data: result.value.invites.data.map((invite) => ({
					id: invite.id.toString(),
					email: invite.email,
					role: invite.role,
					status: invite.status,
					createdAt: invite.createdAt,
				})),
				meta: result.value.invites.meta,
			});
		},
	);
}
