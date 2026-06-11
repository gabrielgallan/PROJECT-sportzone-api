import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court } from '../../enterprise/entities/court';

export interface CourtsFilters {
	query?: string;
	address?: string;
}

export interface CourtsRepository {
	create(court: Court): Promise<void>;
	findById(id: string): Promise<Court | null>;
	listByOrganizationId(
		organizationId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<Court[]>>;
	save(court: Court): Promise<void>;
}
