import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court } from '../../enterprise/entities/court';
import { Cordinate } from '../geocoding/cordinate';

export interface CourtsFilters {
	query?: string;
	address?: string;
}

export interface CourtsRepository {
	create(court: Court): Promise<void>;
	findById(id: string): Promise<Court | null>;
	listMany(filters: CourtsFilters, pagination: PaginationInput): Promise<PaginatedList<Court[]>>;
	listByCordinates(cordinates: Cordinate, pagination: PaginationInput): Promise<PaginatedList<Court[]>>;
	listByOrganizationId(
		organizationId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<Court[]>>;
	save(court: Court): Promise<void>;
}
