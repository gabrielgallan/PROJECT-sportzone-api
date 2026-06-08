import type { InvitesRepository } from '@/domain/identity/application/repositories/invites-repository';
import type { Invite } from '@/domain/identity/enterprise/entities/invite';
import { prisma } from '..';
import { PrismaInviteMapper } from '../mappers/prisma-invite-mapper';

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

	async findManyByUserEmail(email: string) {
		const invites = await prisma.invite.findMany({
			where: {
				email,
			},
		});

		return invites.map(PrismaInviteMapper.toDomain);
	}

	async save(invite: Invite) {
		await prisma.invite.update({
			where: { id: invite.id.toString() },
			data: PrismaInviteMapper.toPrisma(invite),
		});
	}
}
