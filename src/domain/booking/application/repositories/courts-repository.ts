import type { Court } from '../../enterprise/entities/court';

export interface CourtsRepository {
	create(court: Court): Promise<void>;
}
