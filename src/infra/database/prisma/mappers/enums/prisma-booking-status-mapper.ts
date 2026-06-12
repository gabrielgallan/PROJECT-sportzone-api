import type { BookingStatus as PrismaBookingStatus } from 'generated/prisma/enums';
import type { BookingStatus } from '@/domain/booking/enterprise/entities/booking';

const toDomain = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const satisfies Record<PrismaBookingStatus, BookingStatus>

const toPrisma = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const satisfies Record<BookingStatus, PrismaBookingStatus>

export class PrismaBookingStatusMapper {
    static toDomain(status: PrismaBookingStatus): BookingStatus {
        return toDomain[status]
    }

    static toPrisma(status: BookingStatus): PrismaBookingStatus {
        return toPrisma[status]
    }
}