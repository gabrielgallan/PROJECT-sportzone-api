import type { Prisma } from 'generated/prisma/browser';
import { BookingWithCourt } from '@/domain/booking/enterprise/entities/value-objects/booking-with-court';
import { PrismaBookingMapper } from './prisma-booking-mapper';
import { PrismaImageMapper } from './prisma-image-mapper';

type PrismaBookingWithCourt = Prisma.BookingGetPayload<{
	include: {
		court: {
			select: {
				id: true;
				name: true;
				address: true;
				coverImage: true;
			};
		};
	};
}>;

export class PrismaBookingWithCourtMapper {
	static toDomain(raw: PrismaBookingWithCourt): BookingWithCourt {
		return BookingWithCourt.create({
			booking: PrismaBookingMapper.toDomain(raw),
			court: {
				id: raw.court.id,
				name: raw.court.name,
				address: raw.court.address,
				coverImage: raw.court.coverImage ? PrismaImageMapper.toDomain(raw.court.coverImage) : null,
			},
		});
	}
}
