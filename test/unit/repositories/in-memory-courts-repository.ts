import type { PaginationInput } from '@/core/types/pagination';
import type { Cordinate } from '@/domain/booking/application/geocoding/cordinate';
import { getDistanceBetweenCordinates } from '@/domain/booking/application/geocoding/get-distance-between-cordinates';
import type {
	CourtsFilters,
	CourtsRepository,
	OrganizationCourtsFilters,
} from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';
import type { Image } from '@/domain/booking/enterprise/entities/image';
import { CourtDetails } from '@/domain/booking/enterprise/entities/value-objects/court-details';
import { CourtWithCover } from '@/domain/booking/enterprise/entities/value-objects/court-with-cover';
import type { InMemoryCourtImagesRepository } from './in-memory-court-images-repository';
import type { InMemoryCourtSportsRepository } from './in-memory-court-sports-repository';
import type { InMemoryImagesRepository } from './in-memory-images-repository';
import type { InMemorySportsRepository } from './in-memory-sports-repository';

export class InMemoryCourtsRepository implements CourtsRepository {
	public items: Court[] = [];

	constructor(
		private courtImagesRepository: InMemoryCourtImagesRepository,
		private imagesRepository: InMemoryImagesRepository,
		private courtSportsRepository?: InMemoryCourtSportsRepository,
		private sportsRepository?: InMemorySportsRepository,
	) {}

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

		if (!court) return null;

		const courtImages = await this.courtImagesRepository.findManyByCourtId(court.id.toString());

		const images = courtImages.map((courtImage) => {
			const image = this.imagesRepository.items.find((image) => {
				return image.id.equals(courtImage.imageId);
			});

			if (!image) {
				throw new Error(`Image with ID "${courtImage.imageId.toString()}" does not exist.`);
			}

			return image;
		});

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
			images: images,
		});
	}

	async list({ page, limit }: PaginationInput, { name, address, sportSlug }: CourtsFilters) {
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

		if (sportSlug) {
			filteredCourts = filteredCourts.filter((court) => {
				const sports = this.findSportsByCourtId(court.id.toString());

				return sports.some((sport) => sport.slug.value === sportSlug);
			});
		}

		const total = filteredCourts.length;

		const paginated = filteredCourts.slice((page - 1) * limit, page * limit);

		const courtsWithCover = paginated.map((court) => {
			let image: Image | undefined;

			const coverImage = court.coverImage;

			if (coverImage) {
				image = this.imagesRepository.items.find((image) => image.id.equals(coverImage.imageId));
			}

			return CourtWithCover.create({
				courtId: court.id.toString(),
				name: court.name,
				description: court.description ?? null,
				address: court.address,
				coverImage: image ?? null,
				pricePerHour: court.pricePerHour.toCents(),
				rating: court.rating,
				sports: this.findSportsByCourtId(court.id.toString()),
			});
		});

		return {
			data: courtsWithCover,
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

		const courtsWithCover = paginated.map((court) => {
			let image: Image | undefined;

			const coverImage = court.coverImage;

			if (coverImage) {
				image = this.imagesRepository.items.find((image) => image.id.equals(coverImage.imageId));
			}

			return CourtWithCover.create({
				courtId: court.id.toString(),
				name: court.name,
				description: court.description ?? null,
				address: court.address,
				coverImage: image ?? null,
				pricePerHour: court.pricePerHour.toCents(),
				rating: court.rating,
				sports: this.findSportsByCourtId(court.id.toString()),
			});
		});

		return {
			data: courtsWithCover,
			meta: {
				page,
				limit,
				total: nearbyCourts.length,
			},
		};
	}

	async listByOrganizationId(
		organizationId: string,
		{ name, status }: OrganizationCourtsFilters,
		{ page, limit }: PaginationInput,
	) {
		let orgCourts = this.items.filter((c) => c.organizationId.toString() === organizationId);

		if (name) {
			orgCourts = orgCourts.filter((court) =>
				court.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (status) {
			orgCourts = orgCourts.filter((court) => court.status === status);
		}

		const paginated = orgCourts.slice((page - 1) * limit, page * limit);

		const courtsWithCover = paginated.map((court) => {
			let image: Image | undefined;

			const coverImage = court.coverImage;

			if (coverImage) {
				image = this.imagesRepository.items.find((image) => image.id.equals(coverImage.imageId));
			}

			return CourtWithCover.create({
				courtId: court.id.toString(),
				name: court.name,
				description: court.description ?? null,
				address: court.address,
				coverImage: image ?? null,
				pricePerHour: court.pricePerHour.toCents(),
				rating: court.rating,
				sports: this.findSportsByCourtId(court.id.toString()),
			});
		});

		return {
			data: courtsWithCover,
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

		await this.courtImagesRepository.createMany(court.images.getNewItems());

		await this.courtImagesRepository.deleteMany(court.images.getRemovedItems());

		return;
	}

	async delete(court: Court) {
		const courtIndex = this.items.findIndex((c) => c.id.toString() === court.id.toString());

		this.items.splice(courtIndex, 1);

		this.courtImagesRepository.deleteManyByCourtId(court.id.toString());
		this.courtSportsRepository?.deleteManyByCourtId(court.id.toString());

		return;
	}

	private findSportsByCourtId(courtId: string) {
		const courtSports = this.courtSportsRepository?.items.filter(
			(courtSport) => courtSport.courtId.toString() === courtId,
		);

		if (!courtSports || !this.sportsRepository) return [];

		return courtSports.flatMap((courtSport) => {
			const sport = this.sportsRepository?.items.find((sport) =>
				sport.id.equals(courtSport.sportId),
			);

			return sport ? [sport] : [];
		});
	}
}
