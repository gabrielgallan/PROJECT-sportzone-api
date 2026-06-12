import type { PaginationInput } from '@/core/types/pagination';
import type { Cordinate } from '@/domain/booking/application/geocoding/cordinate';
import { getDistanceBetweenCordinates } from '@/domain/booking/application/geocoding/get-distance-between-cordinates';
import type {
	CourtsFilters,
	CourtsRepository,
} from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';
import { CourtDetails } from '@/domain/booking/enterprise/entities/value-objects/court-details';
import type { InMemoryCourtImagesRepository } from './in-memory-court-images-repository';
import type { InMemoryImagesRepository } from './in-memory-images-repository';

export class InMemoryCourtsRepository implements CourtsRepository {
	public items: Court[] = [];

	constructor(private courtImagesRepository: InMemoryCourtImagesRepository, private imagesRepository: InMemoryImagesRepository) {}

	async create(court: Court) {
		this.items.push(court);

		return;
	}

	async findById(id: string) {
		const court = this.items.find((c) => c.id.toString() === id);

		return court ?? null;
	}

	async findByIdWithDetails(id: string) {
		const court = this.items.find((c) => c.id.toString() === id);

		if (!court) return null

		const courtImages = await this.courtImagesRepository.findManyByCourtId(court.id.toString())

		const images = courtImages.map(courtImage => {
			const image = this.imagesRepository.items.find((image) => {
				return image.id.equals(courtImage.imageId)
			})

			if (!image) {
				throw new Error(
					`Image with ID "${courtImage.imageId.toString()}" does not exist.`,
				)
			}

			return image
		})

		return CourtDetails.create({
			courtId: court.id.toString(),
			description: court.description ?? null,
			address: court.address,
			latitude: court.latitude,
			longitude: court.longitude,
			name: court.name,
			pricePerHour: court.pricePerHour.toCents(),
			rating: court.rating,
			reviewsCount: court.reviewsCount,
			images: images
		})
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

		this.items[courtIndex] = court;

		await this.courtImagesRepository.createMany(court.images.getNewItems())

		await this.courtImagesRepository.deleteMany(court.images.getRemovedItems())

		return;
	}

	async delete(court: Court) {
		const courtIndex = this.items.findIndex((c) => c.id.toString() === court.id.toString());

		this.items.splice(courtIndex, 1)

		this.courtImagesRepository.deleteManyByCourtId(court.id.toString());

		return;
	}
}
