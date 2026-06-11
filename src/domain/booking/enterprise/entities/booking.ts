import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';
import type { Cash } from '../../../../core/shared/value-objects/cash';

export type BookingStatus =
	| 'PENDING'
	| 'CONFIRMED'
	| 'CANCELLED'
	| 'COMPLETED';

export interface BookingProps {
	courtId: UniqueEntityID;
	customerId: UniqueEntityID;
	startsAt: Date;
	endsAt: Date;
	status: BookingStatus;
	priceSnapshot: Cash;
	createdAt: Date;
	updatedAt?: Date | null;
	cancelledAt?: Date | null;
}

export class Booking extends Entity<BookingProps> {
	static create(
		props: Optional<
			BookingProps,
			'createdAt' | 'status'
		>,
		id?: UniqueEntityID,
	) {
		const booking = new Booking(
			{
				...props,
				status: props.status ?? 'PENDING',
				createdAt: props.createdAt ?? new Date(),
				updatedAt: props.updatedAt ?? null,
				cancelledAt: props.cancelledAt ?? null,
			},
			id,
		);

		return booking;
	}

	// => Getters
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

	get priceSnapshot() {
		return this.props.priceSnapshot;
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

	set status(status: BookingStatus) {
		this.props.status = status

		this.touch()
	}

	private touch() {
		this.props.updatedAt = new Date();
	}
}
