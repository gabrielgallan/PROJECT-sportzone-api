import type { InviteStatus as PrismaInviteStatus } from 'generated/prisma/enums';
import type { InviteStatus } from '@/domain/identity/enterprise/entities/invite';

export class PrismaInviteStatusMapper {
	static toDomain(status: PrismaInviteStatus): InviteStatus {
		return status as unknown as InviteStatus;
	}

	static toPrisma(status: InviteStatus): PrismaInviteStatus {
		return status as unknown as PrismaInviteStatus;
	}
}
