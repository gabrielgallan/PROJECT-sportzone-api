import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';
import type { Cash } from '../../../../core/shared/value-objects/cash';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingProps {
	courtId: UniqueEntityID;
	customerId: UniqueEntityID;
	startsAt: Date;
	endsAt: Date;
	status: BookingStatus;
	price: Cash;
	expiresAt: Date;
	createdAt: Date;
	updatedAt?: Date | null;
	cancelledAt?: Date | null;
}

export class Booking extends Entity<BookingProps> {
	static create(
		props: Optional<BookingProps, 'createdAt' | 'status' | 'expiresAt'>,
		id?: UniqueEntityID,
	) {
		const createdAt = props.createdAt ?? new Date();
		const booking = new Booking(
			{
				...props,
				status: props.status ?? 'PENDING',
				createdAt,
				expiresAt: props.expiresAt ?? new Date(createdAt.getTime() + 15 * 60 * 1000),
				updatedAt: props.updatedAt ?? null,
				cancelledAt: props.cancelledAt ?? null,
			},
			id,
		);

		return booking;
	}

	// Getters

	get courtId() {
		return this.props.courtId;
	}

	get customerId() {
		return this.props.customerId;
	}

	get startsAt() {
		return this.props.startsAt;
	}

	get endsAt() {
		return this.props.endsAt;
	}

	get status() {
		return this.props.status;
	}

	get price() {
		return this.props.price;
	}

	get expiresAt() {
		return this.props.expiresAt;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	get cancelledAt() {
		return this.props.cancelledAt;
	}

	// Setters

	set status(status: BookingStatus) {
		this.props.status = status;

		this.touch();
	}

	private touch() {
		this.props.updatedAt = new Date();
	}
}
