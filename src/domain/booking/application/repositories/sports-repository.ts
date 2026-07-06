import type { Sport } from '../../enterprise/entities/sport';

export interface SportsRepository {
	findAll(): Promise<Sport[]>
	findManyByIds(ids: string[]): Promise<Sport[]>;
}
