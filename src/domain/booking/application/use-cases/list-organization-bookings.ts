import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { OrganizationBooking } from '../../enterprise/entities/value-objects/organization-booking';
import type { BookingsRepository } from '../repositories/bookings-repository';

interface ListOrganizationBookingsUseCaseRequest {
	organizationId: string;
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
		pagination = { page: 1, limit: 10 },
	}: ListOrganizationBookingsUseCaseRequest): Promise<ListOrganizationBookingsUseCaseResponse> {
		const { data, meta } = await this.bookingsRepository.listByOrganizationId(
			organizationId,
			pagination,
		);

		return right({
			bookingsList: { data, meta },
		});
	}
}
