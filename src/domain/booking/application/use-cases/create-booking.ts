import dayjs from 'dayjs';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { type Either, left, right } from '@/core/types/either';
import { Booking } from '../../enterprise/entities/booking';
import type { BookingsRepository } from '../repositories/bookings-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

type CreateBookingUseCaseRequest = {
	userId: string;
	courtId: string;
	startDate: Date;
	endDate: Date;
};

type CreateBookingUseCaseResponse = Either<ResourceNotFoundError, { booking: Booking }>;

export class CreateBookingUseCase {
	constructor(
		private bookingsRepository: BookingsRepository,
		private courtsRepository: CourtsRepository,
	) {}

	async execute({
		userId,
		courtId,
		startDate,
		endDate,
	}: CreateBookingUseCaseRequest): Promise<CreateBookingUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const startDateJs = dayjs(startDate);
		const endDateJs = dayjs(endDate);

		const diffInHours = endDateJs.diff(startDateJs, 'hour');

		const priceInCents = diffInHours * court.pricePerHour.toCents();

		const booking = Booking.create({
			customerId: new UniqueEntityID(userId),
			courtId: new UniqueEntityID(courtId),
			startsAt: startDate,
			endsAt: endDate,
			price: Cash.fromCents(priceInCents),
		});

		await this.bookingsRepository.create(booking);

		return right({
			booking,
		});
	}
}
