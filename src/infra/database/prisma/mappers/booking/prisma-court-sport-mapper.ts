import type { CourtSport as PrismaCourtSport, Prisma } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { CourtSport } from '@/domain/booking/enterprise/entities/court-sport';

export class PrismaCourtSportMapper {
	static toDomain(raw: PrismaCourtSport): CourtSport {
		return CourtSport.create({
			courtId: new UniqueEntityID(raw.courtId),
			sportId: new UniqueEntityID(raw.sportId),
		});
	}

	static toPrisma(courtSport: CourtSport): Prisma.CourtSportUncheckedCreateInput {
		return {
			courtId: courtSport.courtId.toString(),
			sportId: courtSport.sportId.toString(),
		};
	}
}
