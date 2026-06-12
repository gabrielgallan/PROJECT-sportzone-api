import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';

export interface ReviewProps {
	courtId: UniqueEntityID;
	authorId: UniqueEntityID;
	comment: string;
	rating: number;
	createdAt: Date;
}

export class Review extends Entity<ReviewProps> {
	static create(props: Optional<ReviewProps, 'createdAt'>, id?: UniqueEntityID) {
		const review = new Review(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return review;
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
