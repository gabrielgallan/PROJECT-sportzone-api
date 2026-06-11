import type { PaginationInput } from '@/core/types/pagination';
import type { InvitesRepository } from '@/domain/identity/application/repositories/invites-repository';
import type { Invite } from '@/domain/identity/enterprise/entities/invite';
import { PrismaInviteDetailsMapper } from '../mappers/prisma-invite-details-mapper';
import { PrismaInviteMapper } from '../mappers/prisma-invite-mapper';
import { prisma } from '../prisma';

export class PrismaInvitesRepository implements InvitesRepository {
	async create(invite: Invite) {
		await prisma.invite.create({
			data: PrismaInviteMapper.toPrisma(invite),
		});

		return;
	}

	async findById(inviteId: string) {
		const invite = await prisma.invite.findUnique({
			where: {
				id: inviteId,
			},
		});

		if (!invite) return null;

		return PrismaInviteMapper.toDomain(invite);
	}

	async findManyByUserEmail(email: string, { page, limit }: PaginationInput) {
		const [invites, total] = await Promise.all([
			prisma.invite.findMany({
				select: {
					id: true,
					role: true,
					createdAt: true,
					status: true,
					author: {
						select: {
							name: true,
						},
					},
					organization: {
						select: {
							name: true,
							avatarUrl: true,
						},
					},
				},
				where: {
					email,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.invite.count({
				where: {
					email,
				},
			}),
		]);

		return {
			data: invites.map(PrismaInviteDetailsMapper.toDomain),
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async findByEmailAndOrganizationId(email: string, organizationId: string) {
		const invite = await prisma.invite.findUnique({
			where: {
				email_organizationId: {
					email,
					organizationId,
				},
			},
		});

		if (!invite) return null;

		return PrismaInviteMapper.toDomain(invite);
	}

	async save(invite: Invite) {
		await prisma.invite.update({
			where: { id: invite.id.toString() },
			data: PrismaInviteMapper.toPrisma(invite),
		});
	}
}
