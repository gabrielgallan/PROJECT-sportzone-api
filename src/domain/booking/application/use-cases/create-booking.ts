import { UniqueEntityID } from "@/core/entities/unique-entity-id.ts";
import { type Either, right } from "@/core/types/either.ts";
import dayjs from "dayjs";
import type { CourtBlockedDatesRepository } from "../../../repositories/court-blocked-dates-repository.ts";
import type { SportCourtsRepository } from "../../../repositories/sport-courts-repository.ts";
import { Booking } from "../../enterprise/entities/booking.ts";
import { Cash } from "../../enterprise/entities/value-objects/cash.ts";
import type { BookingsRepository } from "../repositories/bookings-repository.ts";
import { InvalidTimestampBookingInterval } from "./errors/invalid-timestamp-booking-interval.ts";
import { MaxBookingsPerDayError } from "./errors/max-bookings-per-day-error.ts";
import { ResourceNotFound } from "./errors/resource-not-found.ts";
import { SportCourtDateBlocked } from "./errors/sport-court-date-blocked.ts";
import { SportCourtUnavailable } from "./errors/sport-court-unavailable.ts";
import { SportCourtDateAlreadyOccupied } from "./errors/sport-courts-date-already-occupied.ts";

interface CreateBookingUseCaseRequest {
	userId: string;
	sportCourtId: string;
	startTime: Date;
	endTime: Date;
}

type CreateBookingUseCaseResponse = Either<
	| ResourceNotFound
	| SportCourtUnavailable
	| SportCourtDateBlocked
	| SportCourtDateAlreadyOccupied
	| InvalidTimestampBookingInterval
	| MaxBookingsPerDayError,
	{ booking: Booking }
>;

export class CreateBookingUseCase {
	constructor(
		private bookingRepository: BookingsRepository,
		private sportCourtRepository: SportCourtsRepository,
		private courtBlockedDatesRepository: CourtBlockedDatesRepository,
	) {}

	async execute({
		userId,
		sportCourtId,
		startTime,
		endTime,
	}: CreateBookingUseCaseRequest): Promise<CreateBookingUseCaseResponse> {
		const startTimeJs = dayjs(startTime);
		const endTimeJs = dayjs(endTime);

		// Checking if SportCourt exists
		const sportCourt = await this.sportCourtRepository.findById(sportCourtId);

		if (!sportCourt) {
			throw new ResourceNotFound();
		}

		// Checking if Sport Court its avaliable to use
		if (!sportCourt.is_active) {
			throw new SportCourtUnavailable();
		}

		// Checking if court it's blocked on date
		const courtItsBlockedOnDate =
			await this.courtBlockedDatesRepository.findByTimeInterval(
				sportCourtId,
				startTime,
				endTime,
			);

		if (courtItsBlockedOnDate) {
			throw new SportCourtDateBlocked(courtItsBlockedOnDate.reason);
		}

		// Checking if court it's already occupied
		const courtItsAlreadyOccupied =
			await this.bookingRepository.findByCourtIdOnInterval(
				sportCourtId,
				startTime,
				endTime,
			);

		if (courtItsAlreadyOccupied) {
			throw new SportCourtDateAlreadyOccupied();
		}

		//Checking if time interval is chronologically correct
		const dateIsChronologicallyCorrect = startTimeJs.isBefore(endTimeJs);

		if (!dateIsChronologicallyCorrect) {
			throw new InvalidTimestampBookingInterval();
		}

		//Checking if has a 2 hours difference
		const isATwoHoursDifference = startTimeJs.isAfter(dayjs().add(2, "hour"));

		if (!isATwoHoursDifference) {
			throw new InvalidTimestampBookingInterval();
		}

		//Checking if interval has a limit of 6 hours
		const differenceBetweenDates = endTimeJs.diff(startTimeJs, "hour", true);

		if (!(differenceBetweenDates <= 6)) {
			throw new InvalidTimestampBookingInterval();
		}

		// Checking if user has already create a booking today
		const userHasAlreadyBookingToday =
			await this.bookingRepository.findByOwnerIdOnDate(userId, new Date());

		if (userHasAlreadyBookingToday) {
			throw new MaxBookingsPerDayError();
		}

		const courtPerHourPrice = sportCourt.price_per_hour.toNumber();

		// const totalPrice

		const booking = Booking.create({
			courtId: new UniqueEntityID(sportCourtId),
			ownerId: new UniqueEntityID(userId),
			startTime,
			endTime,
			price: Cash.fromAmount(courtPerHourPrice * differenceBetweenDates),
		});

		return right({
			booking,
		});
	}
}
