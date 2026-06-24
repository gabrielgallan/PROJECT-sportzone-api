import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { CourtWithCover } from '../../enterprise/entities/value-objects/court-with-cover';
import type { CourtsRepository } from '../repositories/courts-repository';

interface ListOrganizationCourtsUseCaseRequest {
	organizationId: string;
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
		pagination = { page: 1, limit: 10 },
	}: ListOrganizationCourtsUseCaseRequest): Promise<ListOrganizationCourtsUseCaseResponse> {
		const { data, meta } = await this.courtsRepository.listByOrganizationId(
			organizationId,
			pagination,
		);

		return right({
			courtsList: { data, meta },
		});
	}
}
