import type { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court } from '../../enterprise/entities/court';
import type { CourtsRepository } from '../repositories/courts-repository';

interface ListOrganizationCourtsUseCaseRequest {
	organizationId: string;
	pagination: PaginationInput;
}

type ListOrganizationCourtsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		courtsList: PaginatedList<Court[]>;
	}
>;

export class ListOrganizationCourtsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		organizationId,
		pagination,
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
