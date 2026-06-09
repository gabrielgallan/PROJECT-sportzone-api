import type { Role as PrismaRole } from 'generated/prisma/enums';
import type { MemberRole as DomainRole } from '@/domain/identity/enterprise/entities/member';

const toDomain: Record<PrismaRole, DomainRole> = {
	OWNER: 'OWNER',
	MEMBER: 'MEMBER',
	BILLING: 'BILLING'
}

const toPrisma: Record<DomainRole, PrismaRole> = {
	OWNER: 'OWNER',
	MEMBER: 'MEMBER',
	BILLING: 'BILLING'
}

export class PrismaRoleMapper {
	static toDomain(role: PrismaRole): DomainRole {
		return toDomain[role]
	}

	static toPrisma(role: DomainRole): PrismaRole {
		return toPrisma[role]
	}
}
