import type { CourtOpeningHoursRepository } from '@/domain/booking/application/repositories/court-opening-hours-repository';
import type { CourtOpeningHour } from '@/domain/booking/enterprise/entities/court-opening-hour';
import { PrismaCourtOpeningHourMapper } from '../mappers/booking/prisma-court-opening-hour-mapper';
import { prisma } from '../prisma';

export class PrismaCourtOpeningHoursRepository implements CourtOpeningHoursRepository {
	async createMany(openingHours: CourtOpeningHour[]) {
		if (openingHours.length === 0) return;

		await prisma.courtOpeningHour.createMany({
			data: openingHours.map(PrismaCourtOpeningHourMapper.toPrisma),
		});
	}

	async findManyByCourtId(courtId: string) {
		const openingHours = await prisma.courtOpeningHour.findMany({
			where: { courtId },
			orderBy: [{ weekDay: 'asc' }, { id: 'asc' }],
		});

		return openingHours.map(PrismaCourtOpeningHourMapper.toDomain);
	}

	async findByCourtIdAndWeekDay(courtId: string, weekDay: number) {
		const openingHour = await prisma.courtOpeningHour.findUnique({
			where: {
				courtId_weekDay: { courtId, weekDay },
			},
		});

		return openingHour ? PrismaCourtOpeningHourMapper.toDomain(openingHour) : null;
	}

	async replaceManyByCourtId(courtId: string, openingHours: CourtOpeningHour[]) {
		await prisma.$transaction(async (transaction) => {
			await transaction.courtOpeningHour.deleteMany({ where: { courtId } });

			if (openingHours.length > 0) {
				await transaction.courtOpeningHour.createMany({
					data: openingHours.map(PrismaCourtOpeningHourMapper.toPrisma),
				});
			}
		});
	}

	async deleteManyByCourtId(courtId: string) {
		await prisma.courtOpeningHour.deleteMany({ where: { courtId } });
	}
}
