import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';

export interface CourtReviewProps {
	courtId: UniqueEntityID;
	authorId: UniqueEntityID;
	comment: string;
	rating: number;
	createdAt: Date;
}

export class CourtReview extends Entity<CourtReviewProps> {
	static create(props: Optional<CourtReviewProps, 'createdAt'>, id?: UniqueEntityID) {
		const courtReview = new CourtReview(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return courtReview;
	}

	get courtId() {
		return this.props.courtId;
	}

	get authorId() {
		return this.props.authorId;
	}

	get comment() {
		return this.props.comment;
	}

	get rating() {
		return this.props.rating;
	}

	get createdAt() {
		return this.props.createdAt;
	}
}
