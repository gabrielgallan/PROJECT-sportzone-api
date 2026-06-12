import { type Either, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court } from '../../enterprise/entities/court';
import type { CourtsRepository } from '../repositories/courts-repository';

interface SearchNearbyCourtsUseCaseRequest {
	userLatitude: number;
	userLongitude: number;
	pagination?: PaginationInput;
}

type SearchNearbyCourtsUseCaseResponse = Either<
	null,
	{
		courtsList: PaginatedList<Court[]>;
	}
>;

export class SearchNearbyCourtsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		userLatitude,
		userLongitude,
		pagination = { page: 1, limit: 10 },
	}: SearchNearbyCourtsUseCaseRequest): Promise<SearchNearbyCourtsUseCaseResponse> {
		const cordinate = {
			latitude: userLatitude,
			longitude: userLongitude,
		};

		const { data, meta } = await this.courtsRepository.listNearby(cordinate, pagination);

		return right({
			courtsList: {
				data,
				meta,
			},
		});
	}
}
