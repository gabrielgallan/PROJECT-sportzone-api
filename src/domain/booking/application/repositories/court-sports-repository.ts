import type { CourtSport } from '../../enterprise/entities/court-sport';

export interface CourtSportsRepository {
	createMany(sports: CourtSport[]): Promise<void>;
	deleteMany(sports: CourtSport[]): Promise<void>;
	findManyByCourtId(courtId: string): Promise<CourtSport[]>;
	deleteManyByCourtId(courtId: string): Promise<void>;
}
