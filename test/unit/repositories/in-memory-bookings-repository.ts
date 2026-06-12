import type { PaginationInput } from '@/core/types/pagination';
import type { BookingsRepository } from '@/domain/booking/application/repositories/bookings-repository';
import type { Booking } from '@/domain/booking/enterprise/entities/booking';
import { BookingWithCourt } from '@/domain/booking/enterprise/entities/value-objects/booking-with-court';
import { OrganizationBooking } from '@/domain/booking/enterprise/entities/value-objects/organization-booking';
import type { InMemoryCourtsRepository } from './in-memory-courts-repository';
import type { InMemoryCustomersRepository } from './in-memory-customers-repository';

export class InMemoryBookingsRepository implements BookingsRepository {
	public items: Booking[] = [];

	constructor(
		private courtsRepository: InMemoryCourtsRepository,
		private customersRepository: InMemoryCustomersRepository,
	) {}

	async create(booking: Booking) {
		this.items.push(booking);
	}

	async findById(bookingId: string) {
		const booking = this.items.find((item) => item.id.toString() === bookingId);

		return booking ?? null;
	}

	async findByIdWithCourt(bookingId: string) {
		const booking = this.items.find((item) => item.id.toString() === bookingId);

		if (!booking) return null;

		const court = this.courtsRepository.items.find((court) => court.id.equals(booking.courtId));

		if (!court) {
			throw new Error(`Court ID ${booking.courtId.toString()} does not exists!`);
		}

		return BookingWithCourt.create({
			booking,
			court: {
				id: court.id.toString(),
				name: court.name,
				address: court.address,
				coverImage: court.coverImage,
			},
		});
	}

	async listByUserId(userId: string, { page, limit }: PaginationInput) {
		const userBookings = this.items.filter((item) => item.customerId.toString() === userId);

		const paginated = userBookings.slice((page - 1) * limit, page * limit);

		const bookingWithCourt = paginated.map((booking) => {
			const court = this.courtsRepository.items.find((court) => court.id.equals(booking.courtId));

			if (!court) {
				throw new Error(`Court ID ${booking.courtId.toString()} does not exists!`);
			}

			return BookingWithCourt.create({
				booking,
				court: {
					id: court.id.toString(),
					name: court.name,
					address: court.address,
					coverImage: court.coverImage,
				},
			});
		});

		return {
			data: bookingWithCourt,
			meta: {
				page,
				limit,
				total: userBookings.length,
			},
		};
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const organizationBookings = this.items.filter((item) => {
			const court = this.courtsRepository.items.find((court) => court.id.equals(item.courtId));

			if (!court) {
				throw new Error(`Court ID ${item.courtId.toString()} does not exists!`);
			}

			return court.organizationId.toString() === organizationId;
		});

		const paginated = organizationBookings.slice((page - 1) * limit, page * limit);

		const details = paginated.map((booking) => {
			const court = this.courtsRepository.items.find((court) => court.id.equals(booking.courtId));
			const customer = this.customersRepository.items.find((customer) =>
				customer.id.equals(booking.customerId),
			);

			if (!court) {
				throw new Error(`Court ID ${booking.courtId.toString()} does not exists!`);
			}
			if (!customer) {
				throw new Error(`Customer ID ${booking.courtId.toString()} does not exists!`);
			}

			return OrganizationBooking.create({
				booking,
				court: {
					id: court.id.toString(),
					name: court.name,
				},
				customer: {
					id: customer.id.toString(),
					email: customer.email,
				},
			});
		});

		return {
			data: details,
			meta: {
				page,
				limit,
				total: organizationBookings.length,
			},
		};
	}

	async save(booking: Booking) {
		const bookingIndex = this.items.findIndex((item) => item.id.equals(booking.id));

		if (bookingIndex >= 0) {
			this.items[bookingIndex] = booking;
		}
	}
}
