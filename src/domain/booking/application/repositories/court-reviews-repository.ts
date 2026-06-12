import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { CourtReview } from '../../enterprise/entities/court-review';

export interface CourtReviewsRepository {
	create(courtReview: CourtReview): Promise<void>;
	listByCourtId(
		courtId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<CourtReview[]>>;
}
