import type { InviteStatus as PrismaInviteStatus } from 'generated/prisma/enums';
import type { InviteStatus } from '@/domain/identity/enterprise/entities/invite';

const toDomain = {
	PENDING: 'PENDING',
	ACCEPTED: 'ACCEPTED',
	DECLINED: 'DECLINED'
} as const satisfies Record<PrismaInviteStatus, InviteStatus>

const toPrisma = {
	PENDING: 'PENDING',
	ACCEPTED: 'ACCEPTED',
	DECLINED: 'DECLINED'
} as const satisfies Record<InviteStatus, PrismaInviteStatus>

export class PrismaInviteStatusMapper {
	static toDomain(status: PrismaInviteStatus): InviteStatus {
		return toDomain[status]
	}

	static toPrisma(status: InviteStatus): PrismaInviteStatus {
		return toPrisma[status]
	}
}
