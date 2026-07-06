import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { CourtStatus } from '../../enterprise/entities/court';
import type { CourtWithCover } from '../../enterprise/entities/value-objects/court-with-cover';
import type { CourtsRepository } from '../repositories/courts-repository';

interface ListOrganizationCourtsUseCaseRequest {
	organizationId: string;
	name?: string;
	status?: CourtStatus;
	pagination?: PaginationInput;
}

type ListOrganizationCourtsUseCaseResponse = Either<
	null,
	{
		courtsList: PaginatedList<CourtWithCover[]>;
	}
>;

export class ListOrganizationCourtsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		organizationId,
		name,
		status,
		pagination = { page: 1, limit: 10 },
	}: ListOrganizationCourtsUseCaseRequest): Promise<ListOrganizationCourtsUseCaseResponse> {
		const filters = {
			name,
			status,
		};

		const { data, meta } = await this.courtsRepository.listByOrganizationId(
			organizationId,
			filters,
			pagination,
		);

		return right({
			courtsList: { data, meta },
		});
	}
}
