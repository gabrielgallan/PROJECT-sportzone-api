import type { CourtOpeningHour } from '../../enterprise/entities/value-objects/court-opening-hour';

export interface CourtOpeningHoursRepository {
	createMany(openingHours: CourtOpeningHour[]): Promise<void>;
	findManyByCourtId(courtId: string): Promise<CourtOpeningHour[]>;
	findByCourtIdAndWeekDay(courtId: string, weekDay: number): Promise<CourtOpeningHour | null>;
	deleteManyByCourtId(courtId: string): Promise<void>;
}
