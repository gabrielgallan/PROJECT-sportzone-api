import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Review } from '../../enterprise/entities/review';
import type { ReviewWithAuthor } from '../../enterprise/entities/value-objects/review-with-author';

export interface ReviewsRepository {
	create(review: Review): Promise<void>;
	listByCourtId(
		courtId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<ReviewWithAuthor[]>>;
}
