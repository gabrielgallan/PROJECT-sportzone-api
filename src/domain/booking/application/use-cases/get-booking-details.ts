import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { BookingWithCourt } from '../../enterprise/entities/value-objects/booking-with-court';
import type { BookingsRepository } from '../repositories/bookings-repository';

interface GetBookingDetailsUseCaseRequest {
	bookingId: string;
}

type GetBookingDetailsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		booking: BookingWithCourt;
	}
>;

export class GetBookingDetailsUseCase {
	constructor(private bookingsRepository: BookingsRepository) {}

	async execute({
		bookingId,
	}: GetBookingDetailsUseCaseRequest): Promise<GetBookingDetailsUseCaseResponse> {
		const booking = await this.bookingsRepository.findByIdWithCourt(bookingId);

		if (!booking) {
			return left(new ResourceNotFoundError());
		}

		return right({
			booking,
		});
	}
}
