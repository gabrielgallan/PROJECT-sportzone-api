import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { InviteAccessDeniedError } from '@/domain/identity/application/use-cases/errors/invite-access-denied-error';
import { makeAcceptInviteUseCase } from '@/domain/identity/application/use-cases/factories/make-accept-invite-use-case';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function acceptInviteController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().patch(
		'/invites/:inviteId/accept',
		{
			schema: {
				summary: 'Accept invite',
				tags: ['invites'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					inviteId: z.string(),
				}),
				response: {
					204: z.null(),
					403: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();
			const { inviteId } = request.params;

			const acceptInvite = makeAcceptInviteUseCase();

			const result = await acceptInvite.execute({
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

			reply.status(204).send(null);
		},
	);
}
