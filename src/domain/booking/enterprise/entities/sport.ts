import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/shared/value-objects/slug';
import type { Optional } from '@/core/types/optional';

export interface SportProps {
	name: string;
	slug: Slug;
}

export class Sport extends Entity<SportProps> {
	static create(props: Optional<SportProps, 'slug'>, id?: UniqueEntityID) {
		const sport = new Sport(
			{
				...props,
				slug: props.slug ?? Slug.createFromText(props.name),
			},
			id,
		);

		return sport;
	}

	get name() {
		return this.props.name;
	}

	get slug() {
		return this.props.slug;
	}
}
