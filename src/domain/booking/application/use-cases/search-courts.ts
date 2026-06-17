import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { CourtWithCover } from '../../enterprise/entities/value-objects/court-with-cover';
import type { CourtsRepository } from '../repositories/courts-repository';

interface SearchCourtsUseCaseRequest {
	courtName?: string;
	courtAddress?: string;
	pagination?: PaginationInput;
}

type SearchCourtsUseCaseResponse = Either<
	null,
	{
		courtsList: PaginatedList<CourtWithCover[]>;
	}
>;

export class SearchCourtsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		courtName,
		courtAddress,
		pagination = { page: 1, limit: 10 },
	}: SearchCourtsUseCaseRequest): Promise<SearchCourtsUseCaseResponse> {
		const filters = {
			name: courtName,
			address: courtAddress,
		};

		const { data, meta } = await this.courtsRepository.list(pagination, filters);

		return right({
			courtsList: {
				data,
				meta,
			},
		});
	}
}
