import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { makeInviteMemberUseCase } from '@/domain/identity/application/use-cases/factories/make-invite-member-use-case';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function inviteMemberController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/organizations/:organizationSlug/invites',
		{
			schema: {
				summary: 'Invite member',
				tags: ['invites'],
				security: [{ bearerAuth: [] }],
				body: z.object({
					email: z.email(),
					role: z.union([z.literal('MEMBER'), z.literal('BILLING')]),
				}),
				params: z.object({
					organizationSlug: z.string(),
				}),
				response: {
					201: z.null(),
					403: httpErrorSchema,
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const { organizationSlug } = request.params;
			const { email, role } = request.body;

			const inviteMember = makeInviteMemberUseCase();

			const result = await inviteMember.execute({
				userId,
				organizationSlug,
				invitedEmail: email,
				role,
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

			reply.status(201).send(null);
		},
	);
}
