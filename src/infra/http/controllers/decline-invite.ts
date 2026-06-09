import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InviteAccessDeniedError } from '@/domain/identity/application/use-cases/errors/invite-access-denied-error';
import { makeDeclineInviteUseCase } from '@/domain/identity/application/use-cases/factories/make-decline-invite-use-case';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';

export function declineInviteController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/invites/:inviteId/decline',
		{
			schema: {
				summary: 'Decline invite',
				tags: ['auth'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					inviteId: z.string(),
				}),
				response: {
					200: z.null(),
					403: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();
			const { inviteId } = request.params;

			const declineInvite = makeDeclineInviteUseCase();

			const result = await declineInvite.execute({
				userId,
				inviteId,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						throw new NotFoundError(error.message);

					case InviteAccessDeniedError:
						throw new ForbiddenError(error.message);

					default:
						throw error;
				}
			}

			reply.status(200).send(null);
		},
	);
}
