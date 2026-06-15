import type { CourtOpeningHoursRepository } from '@/domain/booking/application/repositories/court-opening-hours-repository';
import type { CourtOpeningHour } from '@/domain/booking/enterprise/entities/value-objects/court-opening-hour';

export class InMemoryCourtOpeningHoursRepository implements CourtOpeningHoursRepository {
	public items: CourtOpeningHour[] = [];

	async createMany(openingHours: CourtOpeningHour[]) {
		this.items.push(...openingHours);
	}

	async findManyByCourtId(courtId: string) {
		return this.items.filter((openingHour) => openingHour.courtId === courtId);
	}

	async findByCourtIdAndWeekDay(courtId: string, weekDay: number) {
		const openingHour =
			this.items.find(
				(item) => item.courtId === courtId && item.weekDay === weekDay,
			) ?? null;

		return openingHour;
	}

	async deleteManyByCourtId(courtId: string) {
		this.items = this.items.filter((openingHour) => openingHour.courtId !== courtId);
	}
}
