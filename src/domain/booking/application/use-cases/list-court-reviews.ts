import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { CourtReview } from '../../enterprise/entities/court-review';
import type { CourtReviewsRepository } from '../repositories/court-reviews-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

interface ListCourtReviewsUseCaseRequest {
	courtId: string;
	pagination?: PaginationInput;
}

type ListCourtReviewsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		reviewsList: PaginatedList<CourtReview[]>;
	}
>;

export class ListCourtReviewsUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private courtReviewsRepository: CourtReviewsRepository,
	) {}

	async execute({
		courtId,
		pagination = { page: 1, limit: 5 },
	}: ListCourtReviewsUseCaseRequest): Promise<ListCourtReviewsUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const { data, meta } = await this.courtReviewsRepository.listByCourtId(
			court.id.toString(),
			pagination,
		);

		return right({
			reviewsList: { data, meta },
		});
	}
}
