import z from 'zod';
import type { BookingWithCourt } from '@/domain/booking/enterprise/entities/value-objects/booking-with-court';
import type { OrganizationBooking } from '@/domain/booking/enterprise/entities/value-objects/organization-booking';

export const bookingWithCourtSchema = z.object({
	booking: z.object({
		id: z.string(),
		startsAt: z.date(),
		endsAt: z.date(),
		status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
		price: z.number(),
		createdAt: z.date(),
	}),
	court: z.object({
		id: z.string(),
		name: z.string(),
		address: z.string(),
		coverUrl: z.url().nullable(),
	}),
});

export const organizationBookingSchema = z.object({
	booking: z.object({
		id: z.string(),
		startsAt: z.date(),
		endsAt: z.date(),
		status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
		price: z.number(),
		createdAt: z.date(),
	}),
	court: z.object({
		id: z.string(),
		name: z.string(),
	}),
	customer: z.object({
		id: z.string(),
		email: z.email(),
	}),
});

export class BookingWithCourtPresenter {
	static toHTTP({ booking, court }: BookingWithCourt): z.infer<typeof bookingWithCourtSchema> {
		return {
			booking: {
				id: booking.id.toString(),
				startsAt: booking.startsAt,
				endsAt: booking.endsAt,
				status: booking.status,
				price: booking.price.toCents(),
				createdAt: booking.createdAt,
			},
			court: {
				id: court.id,
				name: court.name,
				address: court.address,
				coverUrl: court.coverImage ? court.coverImage.url : null,
			},
		};
	}
}

export class OrganizationBookingPresenter {
	static toHTTP({
		booking,
		court,
		customer,
	}: OrganizationBooking): z.infer<typeof organizationBookingSchema> {
		return {
			booking: {
				id: booking.id.toString(),
				startsAt: booking.startsAt,
				endsAt: booking.endsAt,
				status: booking.status,
				price: booking.price.toCents(),
				createdAt: booking.createdAt,
			},
			court: {
				id: court.id,
				name: court.name,
			},
			customer: {
				id: customer.id,
				email: customer.email,
			},
		};
	}
}
