import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';
import type { CourtImagesRepository } from '../repositories/court-images-repository';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

interface EditCourtUseCaseRequest {
	courtId: string;
	name?: string;
	description?: string;
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

		const currentCourtImages = await this.courtImagesRepository.findManyByCourtId(
			court.id.toString(),
		);

		const courtImagesList = new CourtImagesList(currentCourtImages);

		const courtImages = imagesIds.map((imageId) =>
			CourtImage.create({
				imageId: new UniqueEntityID(imageId),
				courtId: court.id,
			}),
		);

		courtImagesList.update(courtImages);

		court.images = courtImagesList;

		if (name) {
			court.name = name;
		}

		if (description) {
			court.description = description;
		}

		const openingHours = weekDays.map((weekDay) =>
			CourtOpeningHour.create({
				courtId,
				weekDay,
				opensAtInMinutes,
				closesAtInMinutes,
			}),
		);

		if (this.courtsRepository.saveWithOpeningHours) {
			await this.courtsRepository.saveWithOpeningHours(court, openingHours);
		} else if (this.courtOpeningHoursRepository.replaceManyByCourtId) {
			await this.courtsRepository.save(court);
			await this.courtOpeningHoursRepository.replaceManyByCourtId(courtId, openingHours);
		} else {
			await this.courtsRepository.save(court);
			await this.courtOpeningHoursRepository.deleteManyByCourtId(courtId);
			await this.courtOpeningHoursRepository.createMany(openingHours);
		}

		return right({
			court,
		});
	}
}
