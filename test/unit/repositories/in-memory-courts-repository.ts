import type { PaginationInput } from '@/core/types/pagination';
import type { Cordinate } from '@/domain/booking/application/geocoding/cordinate';
import { getDistanceBetweenCordinates } from '@/domain/booking/application/geocoding/get-distance-between-cordinates';
import type {
	CourtsFilters,
	CourtsRepository,
} from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';
import type { InMemoryCourtImagesRepository } from './in-memory-court-images-repository';

export class InMemoryCourtsRepository implements CourtsRepository {
	public items: Court[] = [];

	constructor(private courtImagesRepository: InMemoryCourtImagesRepository) {}

	async create(court: Court) {
		this.items.push(court);

		return;
	}

	async findById(id: string) {
		const court = this.items.find((c) => c.id.toString() === id);

		return court ?? null;
	}

	async list({ page, limit }: PaginationInput, { name, address }: CourtsFilters) {
		let filteredCourts = [...this.items];

		if (name) {
			filteredCourts = filteredCourts.filter((court) =>
				court.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (address) {
			filteredCourts = filteredCourts.filter((court) =>
				court.address.toLowerCase().includes(address.toLowerCase()),
			);
		}

		const total = filteredCourts.length;

		const paginated = filteredCourts.slice((page - 1) * limit, page * limit);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async listNearby(cordinate: Cordinate, { page, limit }: PaginationInput) {
		const nearbyCourts = this.items.filter((court) => {
			const distanceInKm = getDistanceBetweenCordinates({
				from: { latitude: cordinate.latitude, longitude: cordinate.longitude },
				to: { latitude: court.latitude, longitude: court.longitude },
			});

			return distanceInKm <= 10;
		});

		const paginated = nearbyCourts.slice((page - 1) * limit, page * limit);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total: nearbyCourts.length,
			},
		};
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const orgCourts = this.items.filter((c) => c.organizationId.toString() === organizationId);

		const paginated = orgCourts.slice((page - 1) * limit, page * limit);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total: orgCourts.length,
			},
		};
	}

	async save(court: Court) {
		const courtIndex = this.items.findIndex((c) => c.id.toString() === court.id.toString());

		if (courtIndex >= 0) {
			this.items[courtIndex] = court;
		}

		return;
	}

	async delete(court: Court) {
		this.items.filter((c) => c.id.toString() !== court.id.toString());

		await this.courtImagesRepository.deleteManyByCourtId(court.id.toString());

		return;
	}
}
