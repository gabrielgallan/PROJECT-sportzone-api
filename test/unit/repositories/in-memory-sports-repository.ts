import type { SportsRepository } from '@/domain/booking/application/repositories/sports-repository';
import type { Sport } from '@/domain/booking/enterprise/entities/sport';

export class InMemorySportsRepository implements SportsRepository {
	public items: Sport[] = [];

	async findAll() {
		return this.items
	}

	async findManyByIds(ids: string[]) {
		return this.items.filter((sport) => ids.includes(sport.id.toString()));
	}
}
