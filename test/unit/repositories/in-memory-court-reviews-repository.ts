import type { PaginationInput } from '@/core/types/pagination';
import type { ReviewsRepository } from '@/domain/booking/application/repositories/reviews-repository';
import type { Review } from '@/domain/booking/enterprise/entities/review';
import { ReviewWithAuthor } from '@/domain/booking/enterprise/entities/value-objects/review-with-author';
import type { InMemoryCustomersRepository } from './in-memory-customers-repository';

export class InMemoryReviewsRepository implements ReviewsRepository {
	public items: Review[] = [];

	constructor(private customersRepository: InMemoryCustomersRepository) {}

	async create(review: Review) {
		this.items.push(review);
	}

	async listByCourtId(courtId: string, { page, limit }: PaginationInput) {
		const reviews = this.items.filter((item) => item.courtId.toString() === courtId);

		const paginated = reviews.slice((page - 1) * limit, page * limit);

		const reviewsWithAuthor = paginated.map(review => {
			const author = this.customersRepository.items.find(customer => customer.id.equals(review.authorId))

			if (!author) {
				throw new Error(`Customer ID ${review.authorId} does not exist.`)
			}

			return ReviewWithAuthor.create({
				author: {
					name: author.name ?? null,
					email: author.email,
					avatarUrl: author.avatarUrl ?? null
				},
				review: {
					courtId: review.courtId.toString(),
					rating: review.rating,
					comment: review.comment,
					createdAt: review.createdAt
				}
			})
		})

		return {
			data: reviewsWithAuthor,
			meta: {
				page,
				limit,
				total: reviews.length,
			},
		};
	}
}
