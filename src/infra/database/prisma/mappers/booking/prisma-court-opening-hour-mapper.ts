import type { CourtOpeningHour as PrismaCourtOpeningHour } from 'generated/prisma/client';
import { CourtOpeningHour } from '@/domain/booking/enterprise/entities/court-opening-hour';

export class PrismaCourtOpeningHourMapper {
	static toDomain(raw: PrismaCourtOpeningHour): CourtOpeningHour {
		return CourtOpeningHour.create({
			courtId: raw.courtId,
			opensAtInMinutes: raw.opensAtInMinutes,
			closesAtInMinutes: raw.closesAtInMinutes,
			weekDay: raw.weekDay,
		});
	}

	static toPrisma(courtOpeningHour: CourtOpeningHour): PrismaCourtOpeningHour {
		return {
			id: courtOpeningHour.id.toString(),
			courtId: courtOpeningHour.courtId.toString(),
			opensAtInMinutes: courtOpeningHour.opensAtInMinutes,
			closesAtInMinutes: courtOpeningHour.closesAtInMinutes,
			weekDay: courtOpeningHour.weekDay,
		};
	}
}
