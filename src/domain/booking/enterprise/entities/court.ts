import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { Cash } from "./value-objects/cash";

export interface CourtProps {
	ownerId: UniqueEntityID;
	title: string;
	type: string;
	phone?: string | null;
	location: string;
	latitude: number;
	longitude: number;
	isActive: boolean;
	pricePerHour: Cash;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Court extends Entity<CourtProps> {
	static create(props: Optional<CourtProps, "createdAt">, id?: UniqueEntityID) {
		const court = new Court(
			{
				...props,
				phone: props.phone ?? null,
				createdAt: props.createdAt ?? new Date(),
				updatedAt: props.updatedAt ?? null,
			},
			id,
		);

		return court;
	}

	// => Getters
	get ownerId() {
		return this.props.ownerId;
	}

	get title() {
		return this.props.title;
	}

	get type() {
		return this.props.type;
	}

	get phone() {
		return this.props.phone;
	}

	get location() {
		return this.props.location;
	}

	get latitude() {
		return this.props.latitude;
	}

	get longitude() {
		return this.props.longitude;
	}

	get isActive() {
		return this.props.isActive;
	}

	get pricePerHour() {
		return this.props.pricePerHour;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	// => Setters
	set title(title: string) {
		this.props.title = title;

		this.touch();
	}

	set type(type: string) {
		this.props.type = type;

		this.touch();
	}

	set phone(phone: string | null | undefined) {
		this.props.phone = phone;

		this.touch();
	}

	set pricePerHour(pricePerHour: Cash) {
		this.props.pricePerHour = pricePerHour;

		this.touch();
	}

	// => Methods
	private touch() {
		this.props.updatedAt = new Date();
	}
}
