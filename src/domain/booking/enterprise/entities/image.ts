import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';

export interface ImageProps {
	title?: string | null;
	url: string;
	createdAt: Date;
}

export class Image extends Entity<ImageProps> {
	static create(props: Optional<ImageProps, 'createdAt' | 'title'>, id?: UniqueEntityID) {
		const image = new Image(
			{
				...props,
				title: props.title ?? null,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return image;
	}

	get title() {
		return this.props.title;
	}

	get url() {
		return this.props.url;
	}

	get createdAt() {
		return this.props.createdAt;
	}
}
