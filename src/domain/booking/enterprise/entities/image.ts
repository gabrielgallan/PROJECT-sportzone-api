import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface ImageProps {
	title: string;
	url: string;
}

export class Image extends Entity<ImageProps> {
	static create(props: ImageProps, id?: UniqueEntityID) {
		const image = new Image(
			props,
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
}
