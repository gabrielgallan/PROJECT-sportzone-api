import type { AccountProvider as PrismaAccountProvider } from 'generated/prisma/enums';
import type { AccountProvider } from '@/domain/identity/enterprise/entities/account';

const toDomain: Record<PrismaAccountProvider, AccountProvider> = {
	GITHUB: 'GITHUB',
	GOOGLE: 'GOOGLE',
};

const toPrisma: Record<AccountProvider, PrismaAccountProvider> = {
	GITHUB: 'GITHUB',
	GOOGLE: 'GOOGLE',
};

export class PrismaAccountProviderMapper {
	static toPrisma(provider: AccountProvider): PrismaAccountProvider {
		return toPrisma[provider];
	}

	static toDomain(provider: PrismaAccountProvider): AccountProvider {
		return toDomain[provider];
	}
}
