import type { Customer } from '../../enterprise/entities/customer';

export interface CustomersRepository {
	findById(customerId: string): Promise<Customer | null>;
}
