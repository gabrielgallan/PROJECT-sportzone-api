import type { Prisma } from 'generated/prisma/client';
import { MemberWithProfile } from '@/domain/identity/enterprise/entities/value-objects/member-with-profile';
import { PrismaRoleMapper } from './prisma-role-mapper';

type PrismaMemberWithProfile = Prisma.MemberGetPayload<{
	select: {
		id: true
		role: true;
		createdAt: true;
		user: {
			select: {
				id: true;
				name: true;
				email: true;
				avatarUrl: true;
			};
		};
	};
}>;

export class PrismaMemberWithProfileMapper {
	static toDomain(raw: PrismaMemberWithProfile): MemberWithProfile {
		return MemberWithProfile.create({
			user: raw.user,
			membership: {
				id: raw.id,
				role: PrismaRoleMapper.toDomain(raw.role),
				createdAt: raw.createdAt,
			},
		});
	}
}
