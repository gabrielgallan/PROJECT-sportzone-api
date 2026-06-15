import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { BookingsRepository } from '../repositories/bookings-repository';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

dayjs.extend(utc);
dayjs.extend(timezone);

const COURT_TIMEZONE = 'America/Sao_Paulo';
const SLOT_DURATION_IN_MINUTES = 60;
const SLOT_DURATION_IN_MS = SLOT_DURATION_IN_MINUTES * 60 * 1000;

interface GetCourtAvaliableSlotsUseCaseRequest {
	courtId: string;
	date: string;
}

type TimeSlot = {
	time: string;
	available: boolean;
};

type GetCourtAvaliableSlotsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		timeSlots: TimeSlot[];
	}
>;

export class GetCourtAvaliableSlotsUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private bookingsRepository: BookingsRepository,
		private courtOpeningHoursRepository: CourtOpeningHoursRepository,
	) {}

	async execute({
		courtId,
		date,
	}: GetCourtAvaliableSlotsUseCaseRequest): Promise<GetCourtAvaliableSlotsUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const selectedDate = dayjs.tz(`${date}T00:00:00`, COURT_TIMEZONE);
		const openingHour = await this.courtOpeningHoursRepository.findByCourtIdAndWeekDay(
			courtId,
			selectedDate.day(),
		);

		if (!openingHour) {
			return right({
				timeSlots: [],
			});
		}

		const dayStartsAt = selectedDate.startOf('day');
		const dayEndsAt = dayStartsAt.add(1, 'day');
		const openingSlot = dayStartsAt.add(openingHour.opensAtInMinutes, 'minute');
		const closingSlot = dayStartsAt.add(openingHour.closesAtInMinutes, 'minute');
		const now = dayjs().tz(COURT_TIMEZONE);
		const isCurrentDay = selectedDate.isSame(now, 'day');

		const bookings = await this.bookingsRepository.findManyByCourtIdBetweenDates(
			courtId,
			{
				startsAt: dayStartsAt.toDate(),
				endsAt: dayEndsAt.toDate(),
			},
			['PENDING', 'CONFIRMED'],
		);

		const timeSlots: TimeSlot[] = [];

		for (
			let currentSlot = openingSlot;
			currentSlot.isBefore(closingSlot);
			currentSlot = currentSlot.add(SLOT_DURATION_IN_MINUTES, 'minute')
		) {
			const slotStart = currentSlot.toDate();
			const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_IN_MS);

			const hasBlockingBooking = bookings.some((booking) => {
				return booking.startsAt < slotEnd && booking.endsAt > slotStart;
			});

			const hasSlotPassed = isCurrentDay && currentSlot.isBefore(now);

			timeSlots.push({
				time: slotStart.toISOString(),
				available: !hasBlockingBooking && !hasSlotPassed,
			});
		}

		return right({
			timeSlots,
		});
	}
}
