import dayjs from 'dayjs';

import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';

import type { BookingsRepository } from '../repositories/bookings-repository';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

const SLOT_DURATION_IN_MINUTES = 60;

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

		const selectedDate = dayjs(date).startOf('day');

		const openingHour = await this.courtOpeningHoursRepository.findByCourtIdAndWeekDay(
			courtId,
			selectedDate.day(),
		);

		if (!openingHour) {
			return right({ timeSlots: [] });
		}

		const dayStartsAt = selectedDate;
		const dayEndsAt = dayStartsAt.add(1, 'day');

		const openingSlot = dayStartsAt.add(openingHour.opensAtInMinutes, 'minute');

		const closingSlot = dayStartsAt.add(openingHour.closesAtInMinutes, 'minute');

		const now = dayjs();

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
			const slotStart = currentSlot;
			const slotEnd = currentSlot.add(SLOT_DURATION_IN_MINUTES, 'minute');

			const hasBlockingBooking = bookings.some((booking) => {
				const isExpiredPendingBooking =
					booking.status === 'PENDING' && (!booking.expiresAt || booking.expiresAt <= now.toDate());

				if (isExpiredPendingBooking) {
					return false;
				}

				return booking.startsAt < slotEnd.toDate() && booking.endsAt > slotStart.toDate();
			});

			const hasSlotPassed = selectedDate.isSame(now, 'day') && currentSlot.isBefore(now);

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
