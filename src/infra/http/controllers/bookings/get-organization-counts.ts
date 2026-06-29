import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/infra/database/prisma/prisma';
import { httpErrorSchema } from '../../errors/types/http-error';

export function getOrganizationCountsController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		'/organizations/:organizationSlug',
		{
			schema: {
				summary: 'Get org counts',
				tags: ['booking'],
				params: z.object({
					organizationSlug: z.string(),
				}),
				response: {
					200: z.object({ membersCount: z.number(), courtsCount: z.number() }),
					404: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const organization = await request.getOrganizationBySlug();

			const [members, courts] = await Promise.all([
				prisma.member.count({
					where: {
						organizationId: organization.id,
					},
				}),
				prisma.court.count({
					where: {
						organizationId: organization.id,
					},
				}),
			]);

			reply.status(200).send({
				membersCount: members,
				courtsCount: courts,
			});
		},
	);
}
