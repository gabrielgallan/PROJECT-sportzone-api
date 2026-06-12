import type { Booking as PrismaBooking } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking } from '@/domain/booking/enterprise/entities/booking';
import { PrismaBookingStatusMapper } from '../enums/prisma-booking-status-mapper';

export class PrismaBookingMapper {
    static toDomain(raw: PrismaBooking): Booking {
        return Booking.create(
            {
                courtId: new UniqueEntityID(raw.courtId),
                customerId: new UniqueEntityID(raw.userId),
                startsAt: raw.startsAt,
                endsAt: raw.endsAt,
                status: PrismaBookingStatusMapper.toDomain(raw.status),
                price: Cash.fromCents(raw.price),
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
                cancelledAt: raw.canceledAt
            },
            new UniqueEntityID(raw.id),
        );
    }

    static toPrisma(booking: Booking): PrismaBooking {
        return {
            id: booking.id.toString(),
            courtId: booking.courtId.toString(),
            userId: booking.customerId.toString(),
            startsAt: booking.startsAt,
            endsAt: booking.endsAt,
            price: booking.price.toCents(),
            status: PrismaBookingStatusMapper.toPrisma(booking.status),
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt ?? null,
            canceledAt: booking.cancelledAt ?? null
        };
    }
}
