import type { AccountRepository } from '@/domain/identity/application/repositories/account-repository';
import type { Account, AccountProvider } from '@/domain/identity/enterprise/entities/account';
import { PrismaAccountMapper } from '../mappers/prisma-account-mapper';
import { prisma } from '../prisma';
import { PrismaAccountProviderMapper } from '../mappers/prisma-account-provider-mapper';

export class PrismaAccountsRepository implements AccountRepository {
	async create(account: Account) {
		const data = PrismaAccountMapper.toPrisma(account);

		await prisma.account.create({
			data,
		});
	}

	async findByProviderAndUserId(provider: string, userId: string) {
		const account = await prisma.account.findUnique({
			where: {
				provider_userId: {
					provider: PrismaAccountProviderMapper.toPrisma(provider as AccountProvider),
					userId,
				},
			},
		});

		if (!account) {
			return null;
		}

		return PrismaAccountMapper.toDomain(account);
	}
}
