import type { CourtStatus as PrismaCourtStatus } from 'generated/prisma/enums';
import type { CourtStatus } from '@/domain/booking/enterprise/entities/court';

const toDomain = {
    PENDING: 'PENDING',
    IN_MAINTENANCE: 'IN_MAINTENANCE',
    ONLINE: 'ONLINE',
    PAUSED: 'PAUSED'
} as const satisfies Record<PrismaCourtStatus, CourtStatus>

const toPrisma = {
    PENDING: 'PENDING',
    IN_MAINTENANCE: 'IN_MAINTENANCE',
    ONLINE: 'ONLINE',
    PAUSED: 'PAUSED'
} as const satisfies Record<CourtStatus, PrismaCourtStatus>

export class PrismaCourtStatusMapper {
    static toDomain(status: PrismaCourtStatus): CourtStatus {
        return toDomain[status]
    }

    static toPrisma(status: CourtStatus): PrismaCourtStatus {
        return toPrisma[status]
    }
}