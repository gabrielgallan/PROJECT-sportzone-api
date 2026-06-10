import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeListNotificationsUseCase } from '@/domain/notifications/application/use-cases/factories/make-list-notifications-use-case';
import { parsePaginationQuery } from '../../utils/pagination-query';

const notificationSchema = z.object({
	id: z.string(),
	title: z.string(),
	content: z.string(),
	readAt: z.date().nullable(),
	createdAt: z.date(),
});

export function listNotificationsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/notifications',
		{
			schema: {
				summary: 'List notifications',
				tags: ['notifications'],
				security: [{ bearerAuth: [] }],
				querystring: z.object({
					page: z.string().optional(),
					limit: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(notificationSchema),
						meta: z.object({
							page: z.number(),
							limit: z.number(),
							total: z.number(),
						}),
					}),
				},
			},
		},
		async (request, reply) => {
			const recipientId = await request.getUserId();
			const pagination = parsePaginationQuery(request.query);

			const listNotifications = makeListNotificationsUseCase();

			const { notifications: result } = await listNotifications.execute({
				recipientId,
				pagination,
			});

			reply.status(200).send({
				data: result.data.map((notification) => {
					return {
						id: notification.id.toString(),
						title: notification.title,
						content: notification.content,
						readAt: notification.readAt ?? null,
						createdAt: notification.createdAt,
					};
				}),
				meta: result.meta,
			});
		},
	);
}
