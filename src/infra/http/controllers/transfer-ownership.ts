import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { InsufficientPermissionsError } from '@/domain/identity/application/use-cases/errors/insufficient-permissions-error';
import { makeTransferOwnershipUseCase } from '@/domain/identity/application/use-cases/factories/make-transfer-ownership-use-case';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function transferOwnershipController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/organizations/:organizationSlug/members/:memberId/transfer-ownership',
		{
			schema: {
				summary: 'Transfer ownership',
				tags: ['org'],
				security: [{ bearerAuth: [] }],
				params: z.object({
					organizationSlug: z.string(),
					memberId: z.string(),
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
			const { organizationSlug, memberId } = request.params;

			const transferOwnership = makeTransferOwnershipUseCase();

			const result = await transferOwnership.execute({
				userId,
				organizationSlug,
				memberId,
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

			reply.status(204).send(null);
		},
	);
}
