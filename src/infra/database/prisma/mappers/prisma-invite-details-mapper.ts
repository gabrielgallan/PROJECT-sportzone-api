import type { Prisma } from 'generated/prisma/client';
import { InviteDetails } from '@/domain/identity/enterprise/entities/value-objects/invite-details';
import { PrismaRoleMapper } from './prisma-role-mapper';

type PrismaInviteDetails = Prisma.InviteGetPayload<{
	select: {
		id: true;
		role: true;
		createdAt: true;
		status: true;
		author: {
			select: {
				name: true;
			};
		};
		organization: {
			select: {
				name: true;
				avatarUrl: true;
			};
		};
	};
}>;

export class PrismaInviteDetailsMapper {
	static toDomain(raw: PrismaInviteDetails): InviteDetails {
		return InviteDetails.create({
			inviteId: raw.id,
			organization: {
				name: raw.organization.name,
				avatarUrl: raw.organization.avatarUrl,
				authorName: raw.author.name,
			},
			status: raw.status,
			role: PrismaRoleMapper.toDomain(raw.role),
			createdAt: raw.createdAt,
		});
	}
}
