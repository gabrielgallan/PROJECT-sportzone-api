import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { type Either, right } from '@/core/types/either';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import type { CourtsRepository } from '../repositories/courts-repository';

type CreateCourtUseCaseRequest = {
	organizationId: string;
	name: string;
	description?: string;
	coverImageId: string;
	address: string;
	latitude: number;
	longitude: number;
	pricePerHour: number;
	imagesIds: string[];
};

type CreateCourtUseCaseResponse = Either<ResourceNotFoundError, { court: Court }>;

export class CreateCourtUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		organizationId,
		name,
		description,
		coverImageId,
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

		return right({
			court,
		});
	}
}
