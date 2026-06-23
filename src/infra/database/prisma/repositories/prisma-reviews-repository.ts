import type { PaginationInput } from '@/core/types/pagination';
import type { ReviewsRepository } from '@/domain/booking/application/repositories/reviews-repository';
import type { Review } from '@/domain/booking/enterprise/entities/review';
import { PrismaReviewMapper } from '../mappers/booking/prisma-review-mapper';
import { PrismaReviewWithAuthorMapper } from '../mappers/booking/vo/prisma-review-with-author-mapper';
import { prisma } from '../prisma';

export class PrismaReviewsRepository implements ReviewsRepository {
	async create(review: Review) {
		await prisma.review.create({
			data: PrismaReviewMapper.toPrisma(review),
		});

		return;
	}

	async listByCourtId(courtId: string, { page, limit }: PaginationInput) {
		const [reviews, total] = await Promise.all([
			prisma.review.findMany({
				where: { courtId },
				include: {
					author: {
						select: {
							name: true,
							email: true,
							avatarUrl: true
						}
					}
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.review.count({
				where: { courtId },
			}),
		]);

		return {
			data: reviews.map(PrismaReviewWithAuthorMapper.toDomain),
			meta: {
				page,
				limit,
				total,
			},
		};
	}
}
