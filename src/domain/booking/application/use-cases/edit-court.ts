import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { NotAllowedError } from '@/core/shared/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import type { CourtImagesRepository } from '../repositories/court-images-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

interface EditCourtUseCaseRequest {
	courtId: string;
	name: string;
	description: string;

	imagesIds: string[];
}

type EditCourtUseCaseResponse = Either<
	ResourceNotFoundError | NotAllowedError,
	{
		court: Court;
	}
>;

export class EditCourtUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private courtImagesRepository: CourtImagesRepository,
	) {}

	async execute({
		courtId,
		name,
		description,
		imagesIds,
	}: EditCourtUseCaseRequest): Promise<EditCourtUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const currentCourtImages = await this.courtImagesRepository.findManyByCourtId(courtId);

		const courtImagesList = new CourtImagesList(currentCourtImages);

		const courtImages = imagesIds.map((imageId) => {
			return CourtImage.create({
				imageId: new UniqueEntityID(imageId),
				courtId: court.id,
			});
		});

		courtImagesList.update(courtImages);

		court.images = courtImagesList;
		court.name = name;
		court.description = description;

		await this.courtsRepository.save(court);

		return right({
			court,
		});
	}
}
