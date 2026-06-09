import type { TokenType as PrismaTokenType } from 'generated/prisma/client';
import type { TokenType } from '@/domain/identity/enterprise/entities/token';

const toDomain: Record<PrismaTokenType, TokenType> = {
	PASSWORD_RECOVER: 'PASSWORD_RECOVER'
}

const toPrisma: Record<TokenType, PrismaTokenType> = {
	PASSWORD_RECOVER: 'PASSWORD_RECOVER'
}

export class PrismaTokenTypeMapper {
	static toDomain(type: PrismaTokenType): TokenType {
		return toDomain[type]
	}

	static toPrisma(type: TokenType): PrismaTokenType {
		return toPrisma[type]
	}
}
