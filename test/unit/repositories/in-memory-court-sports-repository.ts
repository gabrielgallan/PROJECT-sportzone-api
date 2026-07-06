import type { CourtSportsRepository } from '@/domain/booking/application/repositories/court-sports-repository';
import type { CourtSport } from '@/domain/booking/enterprise/entities/court-sport';

export class InMemoryCourtSportsRepository implements CourtSportsRepository {
	public items: CourtSport[] = [];

	async createMany(sports: CourtSport[]) {
		this.items.push(...sports);
	}

	async deleteMany(sports: CourtSport[]) {
		const sportsIds = sports.map((sport) => sport.id.toString());

		this.items = this.items.filter((sport) => !sportsIds.includes(sport.id.toString()));
	}

	async findManyByCourtId(courtId: string) {
		return this.items.filter((sport) => sport.courtId.toString() === courtId);
	}

	async deleteManyByCourtId(courtId: string) {
		this.items = this.items.filter((sport) => sport.courtId.toString() !== courtId);
	}
}
