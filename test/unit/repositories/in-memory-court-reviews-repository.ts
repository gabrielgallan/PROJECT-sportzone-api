import type { PaginationInput } from '@/core/types/pagination';
import type { ReviewsRepository } from '@/domain/booking/application/repositories/reviews-repository';
import type { Review } from '@/domain/booking/enterprise/entities/review';

export class InMemoryReviewsRepository implements ReviewsRepository {
	public items: Review[] = [];

	async create(review: Review) {
		this.items.push(review);
	}

	async listByCourtId(courtId: string, { page, limit }: PaginationInput) {
		const reviews = this.items.filter((item) => item.courtId.toString() === courtId);

		const paginated = reviews.slice((page - 1) * limit, page * limit);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total: reviews.length,
			},
		};
	}
}
