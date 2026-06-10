import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeReadAllNotificationsUseCase } from '@/domain/notifications/application/use-cases/factories/make-read-all-notifications-use-case';

export function readAllNotificationsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/notifications/read-all',
		{
			schema: {
				summary: 'Read all notification',
				tags: ['notifications'],
				security: [{ bearerAuth: [] }],
				response: {
					204: z.null(),
				},
			},
		},
		async (request, reply) => {
			const recipientId = await request.getUserId();

			const readAllNotification = makeReadAllNotificationsUseCase();

			await readAllNotification.execute({
				recipientId,
			});

			reply.status(204).send(null);
		},
	);
}
