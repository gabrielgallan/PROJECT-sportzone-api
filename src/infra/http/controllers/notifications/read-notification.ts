import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { NotAllowedError } from '@/core/shared/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { makeReadNotificationUseCase } from '@/domain/notifications/application/use-cases/factories/make-read-notification-use-case';
import { ForbiddenError } from '../../errors/forbidden-error';
import { NotFoundError } from '../../errors/not-found-error';

export function readNotificationController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().patch(
		'/notifications/:notificationId/read',
		{
			schema: {
				summary: 'Read notification',
				tags: ['notifications'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					notificationId: z.string(),
				}),
				response: {
					204: z.null(),
				},
			},
		},
		async (request, reply) => {
			const recipientId = await request.getUserId();
			const { notificationId } = request.params;

			const readNotification = makeReadNotificationUseCase();

			const result = await readNotification.execute({
				recipientId,
				notificationId,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case NotAllowedError:
						throw new ForbiddenError(error.message);

					default:
						throw error;
				}
			}

			reply.status(204).send(null);
		},
	);
}
