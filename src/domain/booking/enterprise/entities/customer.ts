import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface CustomerProps {
	email: string;
}

export class Customer extends Entity<CustomerProps> {
	static create(props: CustomerProps, id?: UniqueEntityID) {
		const customer = new Customer(props, id);

		return customer;
	}

	get email() {
		return this.props.email;
	}
}
