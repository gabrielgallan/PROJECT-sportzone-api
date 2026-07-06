import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { type Either, left, right } from '@/core/types/either';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';
import { CourtSport } from '../../enterprise/entities/court-sport';
import { CourtSportsList } from '../../enterprise/entities/court-sports-list';
import type { CourtOpeningHoursRepository } from '../repositories/court-opening-hours-repository';
import type { CourtSportsRepository } from '../repositories/court-sports-repository';
import type { CourtsRepository } from '../repositories/courts-repository';
import type { SportsRepository } from '../repositories/sports-repository';

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
	sportIds?: string[];
	opensAtInMinutes: number;
	closesAtInMinutes: number;
	weekDays: number[];
};

type CreateCourtUseCaseResponse = Either<ResourceNotFoundError, { court: Court }>;

export class CreateCourtUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private courtOpeningHoursRepository: CourtOpeningHoursRepository,
		private sportsRepository: SportsRepository,
		private courtSportsRepository: CourtSportsRepository,
	) {}

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
		sportIds = [],
		opensAtInMinutes,
		closesAtInMinutes,
		weekDays,
	}: CreateCourtUseCaseRequest): Promise<CreateCourtUseCaseResponse> {
		const uniqueSportIds = Array.from(new Set(sportIds));

		if (uniqueSportIds.length > 0) {
			const sports = await this.sportsRepository.findManyByIds(uniqueSportIds);

			if (sports.length !== uniqueSportIds.length) {
				return left(new ResourceNotFoundError());
			}
		}

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
			sports: new CourtSportsList([]),
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

		court.sports = new CourtSportsList(
			uniqueSportIds.map((sportId) =>
				CourtSport.create({
					courtId: court.id,
					sportId: new UniqueEntityID(sportId),
				}),
			),
		);

		const openingHours = weekDays.map((weekDay) =>
			CourtOpeningHour.create({
				courtId: court.id.toString(),
				weekDay,
				opensAtInMinutes,
				closesAtInMinutes,
			}),
		);

		if (this.courtsRepository.createWithOpeningHours) {
			await this.courtsRepository.createWithOpeningHours(court, openingHours);
		} else {
			await this.courtsRepository.create(court);
			await this.courtSportsRepository.createMany(court.sports.getItems());
			await this.courtOpeningHoursRepository.createMany(openingHours);
		}

		return right({
			court,
		});
	}
}
