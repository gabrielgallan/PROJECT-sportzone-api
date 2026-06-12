import type { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { BookingWithCourt } from '../../enterprise/entities/value-objects/booking-with-court';
import type { BookingsRepository } from '../repositories/bookings-repository';

interface ListUserBookingsUseCaseRequest {
	userId: string;
	pagination?: PaginationInput;
}

type ListUserBookingsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		bookingsList: PaginatedList<BookingWithCourt[]>;
	}
>;

export class ListUserBookingsUseCase {
	constructor(private bookingsRepository: BookingsRepository) {}

	async execute({
		userId,
		pagination = { page: 1, limit: 10 },
	}: ListUserBookingsUseCaseRequest): Promise<ListUserBookingsUseCaseResponse> {
		const { data, meta } = await this.bookingsRepository.listByUserId(userId, pagination);

		return right({
			bookingsList: { data, meta },
		});
	}
}
