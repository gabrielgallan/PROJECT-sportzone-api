import type { InviteStatus as PrismaInviteStatus } from 'generated/prisma/enums';
import type { InviteStatus } from '@/domain/identity/enterprise/entities/invite';

const toDomain: Record<PrismaInviteStatus, InviteStatus> = {
	PENDING: 'PENDING',
	ACCEPTED: 'ACCEPTED',
	DECLINED: 'DECLINED'
}

const toPrisma: Record<InviteStatus, PrismaInviteStatus> = {
	PENDING: 'PENDING',
	ACCEPTED: 'ACCEPTED',
	DECLINED: 'DECLINED'
}

export class PrismaInviteStatusMapper {
	static toDomain(status: PrismaInviteStatus): InviteStatus {
		return toDomain[status]
	}

	static toPrisma(status: InviteStatus): PrismaInviteStatus {
		return toPrisma[status]
	}
}
