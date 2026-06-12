import type { CustomersRepository } from '@/domain/booking/application/repositories/customers-repository';
import type { Customer } from '@/domain/booking/enterprise/entities/customer';

export class InMemoryCustomersRepository implements CustomersRepository {
	public items: Customer[] = [];

	async findById(customerId: string) {
		const customer = this.items.find((c) => c.id.toString() === customerId);

		return customer ?? null;
	}
}
