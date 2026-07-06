import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';
import { CourtSport } from '../../enterprise/entities/court-sport';
import { CourtSportsList } from '../../enterprise/entities/court-sports-list';
import type { CourtImagesRepository } from '../repositories/court-images-repository';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtSportsRepository } from '../repositories/court-sports-repository';
import type { CourtsRepository } from '../repositories/courts-repository';
import type { SportsRepository } from '../repositories/sports-repository';

interface EditCourtUseCaseRequest {
	courtId: string;
	name?: string;
	description?: string;
	imagesIds: string[];
	sportIds?: string[];
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
		private sportsRepository: SportsRepository,
		private courtSportsRepository: CourtSportsRepository,
	) {}

	async execute({
		courtId,
		name,
		description,
		imagesIds,
		sportIds,
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

		if (sportIds) {
			const uniqueSportIds = Array.from(new Set(sportIds));

			if (uniqueSportIds.length > 0) {
				const sports = await this.sportsRepository.findManyByIds(uniqueSportIds);

				if (sports.length !== uniqueSportIds.length) {
					return left(new ResourceNotFoundError());
				}
			}

			const currentCourtSports = await this.courtSportsRepository.findManyByCourtId(
				court.id.toString(),
			);

			const courtSportsList = new CourtSportsList(currentCourtSports);

			const courtSports = uniqueSportIds.map((sportId) =>
				CourtSport.create({
					sportId: new UniqueEntityID(sportId),
					courtId: court.id,
				}),
			);

			courtSportsList.update(courtSports);

			court.sports = courtSportsList;
		}

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
			await this.courtSportsRepository.deleteMany(court.sports.getRemovedItems());
			await this.courtSportsRepository.createMany(court.sports.getNewItems());
			await this.courtOpeningHoursRepository.replaceManyByCourtId(courtId, openingHours);
		} else {
			await this.courtsRepository.save(court);
			await this.courtSportsRepository.deleteMany(court.sports.getRemovedItems());
			await this.courtSportsRepository.createMany(court.sports.getNewItems());
			await this.courtOpeningHoursRepository.deleteManyByCourtId(courtId);
			await this.courtOpeningHoursRepository.createMany(openingHours);
		}

		return right({
			court,
		});
	}
}
