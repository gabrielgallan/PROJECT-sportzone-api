import type { Invite as PrismaInvite } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Invite } from '@/domain/identity/enterprise/entities/invite';
import { PrismaInviteStatusMapper } from './prisma-invite-status-mapper';
import { PrismaRoleMapper } from './prisma-role-mapper';

export class PrismaInviteMapper {
	static toDomain(raw: PrismaInvite): Invite {
		return Invite.create(
			{
				authorId: new UniqueEntityID(raw.authorId),
				organizationId: new UniqueEntityID(raw.organizationId),
				email: raw.email,
				role: PrismaRoleMapper.toDomain(raw.role),
				status: PrismaInviteStatusMapper.toDomain(raw.status),
				createdAt: raw.createdAt,
			},
			new UniqueEntityID(raw.id),
		);
	}

	static toPrisma(invite: Invite): PrismaInvite {
		return {
			id: invite.id.toString(),
            authorId: invite.authorId.toString(),
			organizationId: invite.organizationId.toString(),
            email: invite.email,
			role: PrismaRoleMapper.toPrisma(invite.role),
            status: PrismaInviteStatusMapper.toPrisma(invite.status),
			createdAt: invite.createdAt,
		};
	}
}
