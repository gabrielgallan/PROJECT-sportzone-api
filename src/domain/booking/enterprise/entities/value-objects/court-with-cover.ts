import { ValueObject } from '@/core/entities/value-object';
import type { Image } from '../image';
import type { Sport } from '../sport';

interface CourtWithCoverProps {
	courtId: string;
	name: string;
	description: string | null;
	coverImage: Image | null;
	address: string;
	pricePerHour: number;
	rating: number;
	sports: Sport[];
}

export class CourtWithCover extends ValueObject<CourtWithCoverProps> {
	get courtId() {
		return this.props.courtId;
	}

	get name() {
		return this.props.name;
	}

	get description() {
		return this.props.description;
	}

	get coverImage() {
		return this.props.coverImage;
	}

	get address() {
		return this.props.address;
	}

	get pricePerHour() {
		return this.props.pricePerHour;
	}

	get rating() {
		return this.props.rating;
	}

	get sports() {
		return this.props.sports;
	}

	static create(props: CourtWithCoverProps) {
		return new CourtWithCover(props);
	}
}
