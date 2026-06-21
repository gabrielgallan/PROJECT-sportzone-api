import type { CustomersRepository } from '@/domain/booking/application/repositories/customers-repository';
import { PrismaCustomerMapper } from '../mappers/booking/prisma-customer-mapper';
import { prisma } from '../prisma';

export class PrismaCustomersRepository implements CustomersRepository {
	async findById(customerId: string) {
		const customer = await prisma.user.findUnique({
			where: { id: customerId },
		});

		if (!customer) return null;

		return PrismaCustomerMapper.toDomain(customer);
	}
}
