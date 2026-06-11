import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface CourtImageProps {
	courtId: UniqueEntityID;
	imageId: UniqueEntityID;
}

export class CourtImage extends Entity<CourtImageProps> {
	static create(props: CourtImageProps, id?: UniqueEntityID) {
		const courtImage = new CourtImage(props, id);

		return courtImage;
	}

	get courtId() {
		return this.props.courtId;
	}

	get imageId() {
		return this.props.imageId;
	}
}
