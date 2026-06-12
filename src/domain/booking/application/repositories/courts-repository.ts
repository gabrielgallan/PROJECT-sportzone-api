import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court } from '../../enterprise/entities/court';
import type { CourtDetails } from '../../enterprise/entities/value-objects/court-details';
import type { Cordinate } from '../geocoding/cordinate';

export interface CourtsFilters {
	name?: string;
	address?: string;
}

export interface CourtsRepository {
	create(court: Court): Promise<void>;
	findById(id: string): Promise<Court | null>;
	findByIdWithDetails(id: string): Promise<CourtDetails | null>;
	list(pagination: PaginationInput, filters: CourtsFilters): Promise<PaginatedList<Court[]>>;
	listNearby(cordinate: Cordinate, pagination: PaginationInput): Promise<PaginatedList<Court[]>>;
	listByOrganizationId(
		organizationId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<Court[]>>;
	save(court: Court): Promise<void>;
	delete(court: Court): Promise<void>;
}
