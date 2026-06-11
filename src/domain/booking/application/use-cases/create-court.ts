import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import type { CourtsRepository } from '../repositories/courts-repository';

type CreateCourtUseCaseRequest = {
	organizationId: string;
	name: string;
	description?: string;
	coverImageId: string;
	phone?: string;
	address: string;
	latitude: number;
	longitude: number;
	pricePerHour: number;
	imagesIds: string[];
};

type CreateCourtUseCaseResponse = null;

export class CreateCourtUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		organizationId,
		name,
		description,
		coverImageId,
		phone,
		address,
		latitude,
		longitude,
		pricePerHour,
		imagesIds,
	}: CreateCourtUseCaseRequest): Promise<CreateCourtUseCaseResponse> {
		const court = Court.create({
			organizationId: new UniqueEntityID(organizationId),
			name,
			description,
			coverImage: null,
			phone,
			address,
			latitude,
			longitude,
			pricePerHour: Cash.fromCents(pricePerHour),
			images: new CourtImagesList([]),
		});

		const images = imagesIds.map((imageId) => {
			return CourtImage.create({
				imageId: new UniqueEntityID(imageId),
				courtId: court.id,
			});
		});

		court.images = new CourtImagesList(images);

		court.coverImage = CourtImage.create({
			imageId: new UniqueEntityID(coverImageId),
			courtId: court.id,
		});

		await this.courtsRepository.create(court);

		return null;
	}
}
