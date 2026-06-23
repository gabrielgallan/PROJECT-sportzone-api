import type { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';

export interface CourtOpeningHoursRepository {
	createMany(openingHours: CourtOpeningHour[]): Promise<void>;
	findManyByCourtId(courtId: string): Promise<CourtOpeningHour[]>;
	findByCourtIdAndWeekDay(courtId: string, weekDay: number): Promise<CourtOpeningHour | null>;
	replaceManyByCourtId?(courtId: string, openingHours: CourtOpeningHour[]): Promise<void>;
	deleteManyByCourtId(courtId: string): Promise<void>;
}
