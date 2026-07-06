import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface CourtSportProps {
	courtId: UniqueEntityID;
	sportId: UniqueEntityID;
}

export class CourtSport extends Entity<CourtSportProps> {
	static create(props: CourtSportProps, id?: UniqueEntityID) {
		const courtSport = new CourtSport(props, id);

		return courtSport;
	}

	get courtId() {
		return this.props.courtId;
	}

	get sportId() {
		return this.props.sportId;
	}
}
