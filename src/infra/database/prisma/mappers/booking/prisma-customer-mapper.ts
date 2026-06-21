import type { User as PrismaUser } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Customer } from '@/domain/booking/enterprise/entities/customer';

export class PrismaCustomerMapper {
	static toDomain(raw: PrismaUser): Customer {
		return Customer.create(
			{
				email: raw.email,
			},
			new UniqueEntityID(raw.id),
		);
	}
}
