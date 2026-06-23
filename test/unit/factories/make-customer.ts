import { faker } from '@faker-js/faker';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Customer, type CustomerProps } from '@/domain/booking/enterprise/entities/customer';

export function makeCustomer(override: Partial<CustomerProps> = {}, id?: UniqueEntityID) {
	const customer = Customer.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			avatarUrl: null,
			...override,
		},
		id,
	);

	return customer;
}
