import type { Prisma } from 'generated/prisma/browser';
import { ReviewWithAuthor } from '@/domain/booking/enterprise/entities/value-objects/review-with-author';

type PrismaReviewWithAuthor = Prisma.ReviewGetPayload<{
    include: {
        author: {
            select: {
                name: true,
                email: true,
                avatarUrl: true
            }
        }
    }
}>;

export class PrismaReviewWithAuthorMapper {
    static toDomain(raw: PrismaReviewWithAuthor): ReviewWithAuthor {
        return ReviewWithAuthor.create({
            author: raw.author,
            review: {
                courtId: raw.courtId,
                rating: raw.rating,
                comment: raw.comment,
                createdAt: raw.createdAt
            }
        });
    }
}
