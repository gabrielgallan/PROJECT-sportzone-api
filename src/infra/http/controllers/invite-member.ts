import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { makeInviteMemberUseCase } from '@/domain/identity/application/use-cases/factories/make-invite-member-use-case';
import { MemberRole } from '@/domain/identity/enterprise/entities/member';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';

const memberRoleMap = {
	MEMBER: MemberRole.MEMBER,
	BILLING: MemberRole.BILLING,
};

export function inviteMemberController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/organizations/:organizationSlug/invites',
		{
			schema: {
				summary: 'Invite member',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				body: z.object({
					email: z.email(),
					role: z.enum(['MEMBER', 'BILLING']),
				}),
				params: z.object({
					organizationSlug: z.string(),
				}),
				response: {
					201: z.null(),
					403: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
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
				role: memberRoleMap[role],
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
