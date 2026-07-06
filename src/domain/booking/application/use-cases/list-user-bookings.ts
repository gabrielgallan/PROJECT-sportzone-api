import type { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import type { DateRange } from '@/core/types/date-range';
import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { BookingStatus } from '../../enterprise/entities/booking';
import type { BookingWithCourt } from '../../enterprise/entities/value-objects/booking-with-court';
import type { BookingsRepository } from '../repositories/bookings-repository';

interface ListUserBookingsUseCaseRequest {
	userId: string;
	dateRange?: DateRange;
	status?: BookingStatus;
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
		dateRange,
		status,
		pagination = { page: 1, limit: 10 },
	}: ListUserBookingsUseCaseRequest): Promise<ListUserBookingsUseCaseResponse> {
		const filters = {
			dateRange,
			status,
		};

		const { data, meta } = await this.bookingsRepository.listByUserId(userId, filters, pagination);

		return right({
			bookingsList: { data, meta },
		});
	}
}
