import type { PaginationInput } from '@/core/types/pagination';
import type { CourtReviewsRepository } from '@/domain/booking/application/repositories/court-reviews-repository';
import type { CourtReview } from '@/domain/booking/enterprise/entities/court-review';

export class InMemoryCourtReviewsRepository implements CourtReviewsRepository {
	public items: CourtReview[] = [];

	async create(courtReview: CourtReview) {
		this.items.push(courtReview);
	}

	async listByCourtId(courtId: string, { page, limit }: PaginationInput) {
		const courtReviews = this.items.filter((item) => item.courtId.toString() === courtId);

		const paginated = courtReviews.slice((page - 1) * limit, page * limit);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total: courtReviews.length,
			},
		};
	}
}
