import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { CourtOpeningHour } from '../../enterprise/entities/value-objects/court-opening-hour';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtImagesRepository } from '../repositories/court-images-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

interface EditCourtUseCaseRequest {
	courtId: string;
	name: string;
	description: string;
	imagesIds: string[];
	opensAtInMinutes: number;
	closesAtInMinutes: number;
	weekDays: number[];
}

type EditCourtUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		court: Court;
	}
>;

export class EditCourtUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private courtImagesRepository: CourtImagesRepository,
		private courtOpeningHoursRepository: CourtOpeningHoursRepository,
	) {}

	async execute({
		courtId,
		name,
		description,
		imagesIds,
		opensAtInMinutes,
		closesAtInMinutes,
		weekDays,
	}: EditCourtUseCaseRequest): Promise<EditCourtUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const courtImages = imagesIds.map((imageId) =>
			CourtImage.create({
				imageId: new UniqueEntityID(imageId),
				courtId: court.id,
			}),
		);

		court.images = new CourtImagesList(courtImages);
		court.name = name;
		court.description = description;

		await this.courtsRepository.save(court);
		await this.courtImagesRepository.deleteManyByCourtId(courtId);
		await this.courtImagesRepository.createMany(courtImages);
		await this.courtOpeningHoursRepository.deleteManyByCourtId(courtId);

		const openingHours = weekDays.map((weekDay) =>
			CourtOpeningHour.create({
				courtId,
				weekDay,
				opensAtInMinutes,
				closesAtInMinutes,
			}),
		);

		await this.courtOpeningHoursRepository.createMany(openingHours);

		return right({
			court,
		});
	}
}
