import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Review } from '../../enterprise/entities/review';
import type { CourtsRepository } from '../repositories/courts-repository';
import type { ReviewsRepository } from '../repositories/reviews-repository';

interface ListCourtReviewsUseCaseRequest {
	courtId: string;
	pagination?: PaginationInput;
}

type ListCourtReviewsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		reviewsList: PaginatedList<Review[]>;
	}
>;

export class ListCourtReviewsUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private reviewsRepository: ReviewsRepository,
	) {}

	async execute({
		courtId,
		pagination = { page: 1, limit: 5 },
	}: ListCourtReviewsUseCaseRequest): Promise<ListCourtReviewsUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const { data, meta } = await this.reviewsRepository.listByCourtId(
			court.id.toString(),
			pagination,
		);

		return right({
			reviewsList: { data, meta },
		});
	}
}
