import type { Prisma } from 'generated/prisma/client';
import type { CourtSportsRepository } from '@/domain/booking/application/repositories/court-sports-repository';
import type { CourtSport } from '@/domain/booking/enterprise/entities/court-sport';
import { PrismaCourtSportMapper } from '../mappers/booking/prisma-court-sport-mapper';
import { prisma } from '../prisma';

type CourtSportPersistenceClient = Pick<Prisma.TransactionClient, 'courtSport'>;

export async function linkCourtSports(
	client: CourtSportPersistenceClient,
	sports: CourtSport[],
): Promise<void> {
	if (sports.length === 0) return;

	await client.courtSport.createMany({
		data: sports.map(PrismaCourtSportMapper.toPrisma),
		skipDuplicates: true,
	});
}

export async function unlinkCourtSports(
	client: CourtSportPersistenceClient,
	sports: CourtSport[],
): Promise<void> {
	if (sports.length === 0) return;

	await client.courtSport.deleteMany({
		where: {
			OR: sports.map((sport) => ({
				courtId: sport.courtId.toString(),
				sportId: sport.sportId.toString(),
			})),
		},
	});
}

export class PrismaCourtSportsRepository implements CourtSportsRepository {
	async createMany(sports: CourtSport[]) {
		await linkCourtSports(prisma, sports);
	}

	async deleteMany(sports: CourtSport[]) {
		await unlinkCourtSports(prisma, sports);
	}

	async findManyByCourtId(courtId: string) {
		const sports = await prisma.courtSport.findMany({
			where: { courtId },
			orderBy: { sportId: 'asc' },
		});

		return sports.map(PrismaCourtSportMapper.toDomain);
	}

	async deleteManyByCourtId(courtId: string) {
		await prisma.courtSport.deleteMany({
			where: { courtId },
		});
	}
}
