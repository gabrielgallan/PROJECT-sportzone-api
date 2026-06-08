import type { Role as PrismaRole } from 'generated/prisma/enums';
import type { MemberRole } from '@/domain/identity/enterprise/entities/member';

export class PrismaRoleMapper {
	static toDomain(role: PrismaRole): MemberRole {
		return role as unknown as MemberRole;
	}

	static toPrisma(memberRole: MemberRole): PrismaRole {
		return memberRole as unknown as PrismaRole;
	}
}
