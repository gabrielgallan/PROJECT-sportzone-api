import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { Cash } from "./value-objects/cash";

enum BookingStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	CANCELLED = "CANCELLED",
}

export interface BookingProps {
	courtId: UniqueEntityID;
	ownerId: UniqueEntityID;
	startTime: Date;
	endTime: Date;
	status: BookingStatus;
	price: Cash;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Booking extends Entity<BookingProps> {
	static create(
		props: Optional<BookingProps, "createdAt" | "status">,
		id?: UniqueEntityID,
	) {
		const booking = new Booking(
			{
				...props,
				status: props.status ?? BookingStatus.PENDING,
				createdAt: props.createdAt ?? new Date(),
				updatedAt: props.updatedAt ?? null,
			},
			id,
		);

		return booking;
	}

	// => Getters
	get courtId() {
		return this.props.courtId;
	}

	get ownerId() {
		return this.props.ownerId;
	}

	get startTime() {
		return this.props.startTime;
	}

	get endTime() {
		return this.props.endTime;
	}

	get status() {
		return this.props.status;
	}

	get price() {
		return this.props.price;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	// => Setters

	// => Methods
	private touch() {
		this.props.updatedAt = new Date();
	}
}
