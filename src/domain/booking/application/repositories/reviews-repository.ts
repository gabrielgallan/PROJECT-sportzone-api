import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Review } from '../../enterprise/entities/review';

export interface ReviewsRepository {
	create(review: Review): Promise<void>;
	listByCourtId(
		courtId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<Review[]>>;
}
