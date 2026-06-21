import type { Prisma } from 'generated/prisma/browser';
import { OrganizationBooking } from '@/domain/booking/enterprise/entities/value-objects/organization-booking';
import { PrismaBookingMapper } from '../prisma-booking-mapper';

type PrismaOrganizationBooking = Prisma.BookingGetPayload<{
	include: {
		court: {
			select: {
				id: true;
				name: true;
			};
		};
		user: {
			select: {
				id: true;
				email: true;
			};
		};
	};
}>;

export class PrismaOrganizationBookingMapper {
	static toDomain(raw: PrismaOrganizationBooking): OrganizationBooking {
		return OrganizationBooking.create({
			booking: PrismaBookingMapper.toDomain(raw),
			court: {
				id: raw.court.id,
				name: raw.court.name,
			},
			customer: {
				id: raw.user.id,
				email: raw.user.email,
			},
		});
	}
}
