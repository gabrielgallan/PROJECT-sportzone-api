import type { SportsRepository } from '@/domain/booking/application/repositories/sports-repository';
import { PrismaSportMapper } from '../mappers/booking/prisma-sport-mapper';
import { prisma } from '../prisma';

export class PrismaSportsRepository implements SportsRepository {
	async findAll() {
		const sports = await prisma.sport.findMany();

		return sports.map(PrismaSportMapper.toDomain);
	}

	async findManyByIds(ids: string[]) {
		if (ids.length === 0) return [];

		const sports = await prisma.sport.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return sports.map(PrismaSportMapper.toDomain);
	}
}
