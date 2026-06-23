import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface CustomerProps {
	name?: string | null;
	email: string;
	avatarUrl?: string | null;
}

export class Customer extends Entity<CustomerProps> {
	static create(props: CustomerProps, id?: UniqueEntityID) {
		const customer = new Customer(props, id);

		return customer;
	}

	get name() {
		return this.props.name;
	}

	get email() {
		return this.props.email;
	}

	get avatarUrl() {
		return this.props.avatarUrl;
	}
}
