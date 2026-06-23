import { ValueObject } from '@/core/entities/value-object';

interface ReviewWithAuthorProps {
    author: {
        name: string  | null
        email: string
        avatarUrl: string | null
    }
    review: {
        courtId: string
        comment: string
        rating: number
        createdAt: Date
    }
}

export class ReviewWithAuthor extends ValueObject<ReviewWithAuthorProps> {
    static create(props: ReviewWithAuthorProps) {
        return new ReviewWithAuthor(props);
    }

    get author() {
        return this.props.author;
    }

    get review() {
        return this.props.review;
    }
}
