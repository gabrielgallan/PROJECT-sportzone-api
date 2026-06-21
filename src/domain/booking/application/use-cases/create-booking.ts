import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { type Either, left, right } from '@/core/types/either';
import { Booking } from '../../enterprise/entities/booking';
import type { BookingsRepository } from '../repositories/bookings-repository';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtsRepository } from '../repositories/courts-repository';
import type { CustomersRepository } from '../repositories/customers-repository';
import { CourtAlreadyReservedError } from './errors/court-already-reserved';
import { CourtUnavailableError } from './errors/court-unavailable-error';
import { CustomerBookingConflictError } from './errors/customer-booking-conflict-error';
import { CustomerBookingLimitError } from './errors/customer-booking-limit-error';
import { InvalidBookingDatetimeError } from './errors/invalid-booking-datetime-error';

type CreateBookingUseCaseRequest = {
	userId: string;
	courtId: string;
	startDate: Date;
	endDate: Date;
};

type CreateBookingError =
	| ResourceNotFoundError
	| CourtUnavailableError
	| InvalidBookingDatetimeError
	| CustomerBookingLimitError
	| CourtAlreadyReservedError
	| CustomerBookingConflictError;

type CreateBookingUseCaseResponse = Either<CreateBookingError, { booking: Booking }>;

export class CreateBookingUseCase {
	constructor(
		private bookingsRepository: BookingsRepository,
		private courtsRepository: CourtsRepository,
		private customersRepository: CustomersRepository,
		private courtOpeningHoursRepository: CourtOpeningHoursRepository,
	) {}

	async execute({
		userId,
		courtId,
		startDate,
		endDate,
	}: CreateBookingUseCaseRequest): Promise<CreateBookingUseCaseResponse> {
		const [court, customer] = await Promise.all([
			this.courtsRepository.findById(courtId),
			this.customersRepository.findById(userId),
		]);

		// Court and Customer validations

		if (!court || !customer) {
			return left(new ResourceNotFoundError('Court or customer was not found.'));
		}

		// Validate if the court is available for bookings.
		if (court.status !== 'ONLINE') {
			return left(new CourtUnavailableError());
		}

		const now = new Date();

		const minStartDate = new Date(now.getTime() + 60 * 60 * 1000);
		const maxStartDate = new Date(now);

		maxStartDate.setDate(maxStartDate.getDate() + 90);

		// Validate if the booking is within the allowed advance period.
		if (startDate < minStartDate || startDate > maxStartDate) {
			return left(
				new InvalidBookingDatetimeError(
					'Booking must start at least 1 hour and no more than 90 days in advance.',
				),
			);
		}

		const openingHour = await this.courtOpeningHoursRepository.findByCourtIdAndWeekDay(
			courtId,
			startDate.getDay(),
		);

		// Validate if the court has opening hours for the selected day.
		if (!openingHour) {
			return left(
				new InvalidBookingDatetimeError(
					'The selected court is closed on the requested day.',
				),
			);
		}

		const dayStartsAt = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate(),
		);

		const dayEndsAt = new Date(dayStartsAt);
		dayEndsAt.setDate(dayEndsAt.getDate() + 1);

		const courtOpensAt = new Date(dayStartsAt);
		courtOpensAt.setMinutes(openingHour.opensAtInMinutes);

		const courtClosesAt = new Date(dayStartsAt);
		courtClosesAt.setMinutes(openingHour.closesAtInMinutes);

		// Validate if the booking is inside the court opening hours.
		if (startDate < courtOpensAt || endDate > courtClosesAt) {
			return left(
				new InvalidBookingDatetimeError(
					'Booking must be within the selected court opening hours.',
				),
			);
		}

		// Booking validations

		const activeStatuses = ['PENDING', 'CONFIRMED'] as const;

		const [courtBookings, customerBookings] = await Promise.all([
			this.bookingsRepository.findManyByCourtIdBetweenDates(
				courtId,
				{ startsAt: dayStartsAt, endsAt: dayEndsAt },
				[...activeStatuses],
			),
			this.bookingsRepository.findManyByCustomerIdBetweenDates(
				userId,
				{ startsAt: dayStartsAt, endsAt: dayEndsAt },
				[...activeStatuses],
			),
		]);

		// Keep only confirmed bookings or pending bookings that have not expired yet.
		const validCourtBookings = courtBookings.filter((booking) => {
			return (
				booking.status === 'CONFIRMED' ||
				(booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt > now)
			);
		});

		// Keep only confirmed bookings or pending bookings that have not expired yet.
		const validCustomerBookings = customerBookings.filter((booking) => {
			return (
				booking.status === 'CONFIRMED' ||
				(booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt > now)
			);
		});

		// Validate if the user already has a booking for today.
		if (validCustomerBookings.length > 0) {
			return left(
				new CustomerBookingLimitError(
					'Customer already has an active booking on the requested day.',
				),
			);
		}

		// Validate if the court already has a booking in the requested time range.
		if (
			validCourtBookings.some((booking) => {
				return booking.startsAt < endDate && booking.endsAt > startDate;
			})
		) {
			return left(new CourtAlreadyReservedError());
		}

		// Validate if the user already has a booking in the requested time range.
		if (
			validCustomerBookings.some((booking) => {
				return booking.startsAt < endDate && booking.endsAt > startDate;
			})
		) {
			return left(new CustomerBookingConflictError());
		}

		const durationInHours = (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000);

		const booking = Booking.create({
			customerId: new UniqueEntityID(userId),
			courtId: new UniqueEntityID(courtId),
			startsAt: startDate,
			endsAt: endDate,
			price: Cash.fromCents(durationInHours * court.pricePerHour.toCents()),
			createdAt: now,
			expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
		});

		await this.bookingsRepository.create(booking);

		return right({ booking });
	}
}
