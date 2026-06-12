import type { Role as PrismaRole } from 'generated/prisma/enums';
import type { MemberRole as DomainRole } from '@/domain/identity/enterprise/entities/member';

const toDomain = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  BILLING: 'BILLING',
} as const satisfies Record<PrismaRole, DomainRole>

const toPrisma = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  BILLING: 'BILLING',
} as const satisfies Record<DomainRole, PrismaRole>

export class PrismaRoleMapper {
	static toDomain(role: PrismaRole): DomainRole {
		return toDomain[role]
	}

	static toPrisma(role: DomainRole): PrismaRole {
		return toPrisma[role]
	}
}
