import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { Cash } from "./value-objects/cash";

enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export interface PaymentProps {
	bookingId: UniqueEntityID;
	amount: Cash;
	currency: string;
	status: PaymentStatus;
    method: string;
	paidAt?: Date | null;
	createdAt: Date;
}

export class Payment extends Entity<PaymentProps> {
	static create(
		props: Optional<PaymentProps, "createdAt">,
		id?: UniqueEntityID,
	) {
		const payment = new Payment(
			{
				...props,
                paidAt: props.paidAt ?? null,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return payment;
	}

	// => Getters
	get bookingId() {
		return this.props.bookingId;
	}

	get amount() {
		return this.props.amount;
	}

	get currency() {
		return this.props.currency;
	}

	get status() {
		return this.props.status;
	}

	get method() {
		return this.props.method;
	}

	get paidAt() {
		return this.props.paidAt;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	// => Setters

	// => Methods
}
