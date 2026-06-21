import type { Review as PrismaReview } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Review } from '@/domain/booking/enterprise/entities/review';

export class PrismaReviewMapper {
	static toDomain(raw: PrismaReview): Review {
		return Review.create(
			{
				authorId: new UniqueEntityID(raw.authorId),
				courtId: new UniqueEntityID(raw.courtId),
				comment: raw.comment,
				rating: raw.rating,
				createdAt: raw.createdAt,
			},
			new UniqueEntityID(raw.id),
		);
	}

	static toPrisma(review: Review): PrismaReview {
		return {
			id: review.id.toString(),
			authorId: review.authorId.toString(),
			courtId: review.courtId.toString(),
			comment: review.comment,
			rating: review.rating,
			createdAt: review.createdAt,
		};
	}
}
