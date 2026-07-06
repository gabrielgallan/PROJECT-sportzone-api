import { type Either, right } from '@/core/types/either';
import type { DateRange } from '@/core/types/date-range';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { BookingStatus } from '../../enterprise/entities/booking';
import type { OrganizationBooking } from '../../enterprise/entities/value-objects/organization-booking';
import type { BookingsRepository } from '../repositories/bookings-repository';

interface ListOrganizationBookingsUseCaseRequest {
	organizationId: string;
	dateRange?: DateRange;
	status?: BookingStatus;
	pagination?: PaginationInput;
}

type ListOrganizationBookingsUseCaseResponse = Either<
	null,
	{
		bookingsList: PaginatedList<OrganizationBooking[]>;
	}
>;

export class ListOrganizationBookingsUseCase {
	constructor(private bookingsRepository: BookingsRepository) {}

	async execute({
		organizationId,
		dateRange,
		status,
		pagination = { page: 1, limit: 10 },
	}: ListOrganizationBookingsUseCaseRequest): Promise<ListOrganizationBookingsUseCaseResponse> {
		const filters = {
			dateRange,
			status,
		};

		const { data, meta } = await this.bookingsRepository.listByOrganizationId(
			organizationId,
			filters,
			pagination,
		);

		return right({
			bookingsList: { data, meta },
		});
	}
}
