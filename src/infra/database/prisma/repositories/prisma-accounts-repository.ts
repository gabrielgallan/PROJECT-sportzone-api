import { AccountProvider } from 'generated/prisma/client';
import type { AccountRepository } from '@/domain/identity/application/repositories/account-repository';
import type { Account } from '@/domain/identity/enterprise/entities/account';
import { prisma } from '..';
import { PrismaAccountMapper } from '../mappers/prisma-account-mapper';

export class PrismaAccountsRepository implements AccountRepository {
	async create(account: Account) {
		const data = PrismaAccountMapper.toPrisma(account);

		await prisma.account.create({
			data,
		});
	}

	async findByProviderAndUserId(provider: string, userId: string) {
		let prismaProvider: AccountProvider;

		switch (provider) {
			case 'GITHUB':
				prismaProvider = AccountProvider.GITHUB;
				break;
			default:
				throw new Error(`Invalid provider: ${provider}`);
		}

		const account = await prisma.account.findUnique({
			where: {
				provider_userId: {
					provider: prismaProvider,
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
