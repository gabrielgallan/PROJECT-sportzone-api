import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Booking, BookingStatus } from '../../enterprise/entities/booking';
import type { BookingWithCourt } from '../../enterprise/entities/value-objects/booking-with-court';
import type { OrganizationBooking } from '../../enterprise/entities/value-objects/organization-booking';

export type BookingCreationResult =
	| { status: 'CREATED' }
	| { status: 'COURT_CONFLICT' }
	| { status: 'CUSTOMER_DAILY_LIMIT' };

export interface BookingCreationConstraints {
	dayStartsAt: Date;
	dayEndsAt: Date;
	now: Date;
}

export interface BookingsRepository {
	create(
		booking: Booking,
		constraints?: BookingCreationConstraints,
	): Promise<BookingCreationResult | void>;
	findById(bookingId: string): Promise<Booking | null>;
	findByIdWithCourt(bookingId: string): Promise<BookingWithCourt | null>;
	listByOrganizationId(
		organizationId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<OrganizationBooking[]>>;
	listByUserId(
		userId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<BookingWithCourt[]>>;
	findManyByCourtIdBetweenDates(
		courtId: string,
		range: { startsAt: Date; endsAt: Date },
		statuses: BookingStatus[],
	): Promise<Booking[]>;
	findManyByCustomerIdBetweenDates(
		customerId: string,
		range: { startsAt: Date; endsAt: Date },
		statuses: BookingStatus[],
	): Promise<Booking[]>;
	save(booking: Booking): Promise<void>;
}
