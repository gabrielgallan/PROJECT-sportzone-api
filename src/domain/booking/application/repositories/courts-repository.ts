import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Court, CourtStatus } from '../../enterprise/entities/court';
import type { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';
import type { CourtDetails } from '../../enterprise/entities/value-objects/court-details';
import type { CourtWithCover } from '../../enterprise/entities/value-objects/court-with-cover';
import type { Cordinate } from '../geocoding/cordinate';

export interface CourtsFilters {
	name?: string;
	address?: string;
	sportSlug?: string;
}

export interface OrganizationCourtsFilters {
	name?: string;
	status?: CourtStatus;
}

export interface CourtsRepository {
	create(court: Court): Promise<void>;
	createWithOpeningHours?(court: Court, openingHours: CourtOpeningHour[]): Promise<void>;
	findById(id: string): Promise<Court | null>;
	findByIdWithDetails(id: string): Promise<CourtDetails | null>;
	list(
		pagination: PaginationInput,
		filters: CourtsFilters,
	): Promise<PaginatedList<CourtWithCover[]>>;
	listNearby(
		cordinate: Cordinate,
		pagination: PaginationInput,
	): Promise<PaginatedList<CourtWithCover[]>>;
	listByOrganizationId(
		organizationId: string,
		filters: OrganizationCourtsFilters,
		pagination: PaginationInput,
	): Promise<PaginatedList<CourtWithCover[]>>;
	save(court: Court): Promise<void>;
	saveWithOpeningHours?(court: Court, openingHours: CourtOpeningHour[]): Promise<void>;
	delete(court: Court): Promise<void>;
}
