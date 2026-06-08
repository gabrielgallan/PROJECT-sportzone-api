import type { TokensRepository } from '@/domain/identity/application/repositories/tokens-repository';
import type { Token } from '@/domain/identity/enterprise/entities/token';
import { prisma } from '..';
import { PrismaTokenMapper } from '../mappers/prisma-token-mapper';

export class PrismaTokensRepository implements TokensRepository {
	async create(token: Token) {
		const data = PrismaTokenMapper.toPrisma(token);

		await prisma.token.create({
			data,
		});

		return;
	}

	async findById(id: string) {
		const token = await prisma.token.findUnique({
			where: {
				id,
			},
		});

		if (!token) {
			return null;
		}

		return PrismaTokenMapper.toDomain(token);
	}

	async save(token: Token) {
		const data = PrismaTokenMapper.toPrisma(token);

		await prisma.token.update({
			where: {
				id: token.id.toString(),
			},
			data,
		});

		return;
	}
}
