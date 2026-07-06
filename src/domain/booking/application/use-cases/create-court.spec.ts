import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { InMemoryCourtSportsRepository } from 'test/unit/repositories/in-memory-court-sports-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { InMemorySportsRepository } from 'test/unit/repositories/in-memory-sports-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { CourtImage } from '../../enterprise/entities/court-image';
import { Sport } from '../../enterprise/entities/sport';
import { CreateCourtUseCase } from './create-court';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let courtSportsRepository: InMemoryCourtSportsRepository;
let courtOpeningHoursRepository: InMemoryCourtOpeningHoursRepository;
let imagesRepository: InMemoryImagesRepository;
let sportsRepository: InMemorySportsRepository;
let sut: CreateCourtUseCase;

describe('Create court use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		courtSportsRepository = new InMemoryCourtSportsRepository();
		courtOpeningHoursRepository = new InMemoryCourtOpeningHoursRepository();
		imagesRepository = new InMemoryImagesRepository();
		sportsRepository = new InMemorySportsRepository();
		courtsRepository = new InMemoryCourtsRepository(
			courtImagesRepository,
			imagesRepository,
			courtSportsRepository,
			sportsRepository,
		);

		sportsRepository.items.push(
			Sport.create({ name: 'Soccer' }, new UniqueEntityID('soccer')),
			Sport.create({ name: 'Volley' }, new UniqueEntityID('volley')),
		);

		sut = new CreateCourtUseCase(
			courtsRepository,
			courtOpeningHoursRepository,
			sportsRepository,
			courtSportsRepository,
		);
	});

	it('should be able to create a court', async () => {
		const result = await sut.execute({
			organizationId: 'org-1',
			name: 'Sport Court 1',
			address: 'Some Street, 2',
			latitude: -23.4567,
			longitude: -46.4567,
			pricePerHour: 3000,
			coverImageId: 'image-1',
			imagesIds: [],
			sportIds: ['soccer', 'volley'],
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
			weekDays: [1, 3, 5],
		});

		expect(result.isRight()).toBe(true);
		expect(courtsRepository.items).toHaveLength(1);
		expect(courtsRepository.items[0].name).toBe('Sport Court 1');
		expect(courtsRepository.items[0].coverImage).toBeInstanceOf(CourtImage);
		expect(courtSportsRepository.items.map((item) => item.sportId.toString())).toEqual([
			'soccer',
			'volley',
		]);
		expect(courtOpeningHoursRepository.items).toHaveLength(3);
		expect(courtOpeningHoursRepository.items.map((item) => item.weekDay)).toEqual([1, 3, 5]);
		expect(courtOpeningHoursRepository.items.map((item) => item.courtId)).toEqual([
			courtsRepository.items[0].id.toString(),
			courtsRepository.items[0].id.toString(),
			courtsRepository.items[0].id.toString(),
		]);
	});

	it('should initialize court images and persist opening hours', async () => {
		const result = await sut.execute({
			organizationId: 'org-1',
			name: 'Sport Court 1',
			description: 'Indoor court',
			address: 'Some Street, 2',
			latitude: -23.4567,
			longitude: -46.4567,
			pricePerHour: 3000,
			coverImageId: 'image-cover',
			imagesIds: ['image-1', 'image-2'],
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
			weekDays: [0, 6],
		});

		expect(result.isRight()).toBe(true);

		const createdCourt = courtsRepository.items[0];

		expect(createdCourt.images.currentItems.map((image) => image.imageId.toString())).toEqual([
			'image-1',
			'image-2',
		]);
		expect(createdCourt.coverImage?.imageId.toString()).toBe('image-cover');
		expect(courtOpeningHoursRepository.items.map((item) => item.weekDay)).toEqual([0, 6]);
		expect(courtOpeningHoursRepository.items.map((item) => item.opensAtInMinutes)).toEqual([
			8 * 60,
			8 * 60,
		]);
	});

	it('should be able to create a court without sports', async () => {
		const result = await sut.execute({
			organizationId: 'org-1',
			name: 'Sport Court 1',
			address: 'Some Street, 2',
			latitude: -23.4567,
			longitude: -46.4567,
			pricePerHour: 3000,
			coverImageId: 'image-1',
			imagesIds: [],
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
			weekDays: [1, 3, 5],
		});

		expect(result.isRight()).toBe(true);
		expect(courtSportsRepository.items).toHaveLength(0);
	});

	it('should not be able to create a court with a non-existing sport', async () => {
		const result = await sut.execute({
			organizationId: 'org-1',
			name: 'Sport Court 1',
			address: 'Some Street, 2',
			latitude: -23.4567,
			longitude: -46.4567,
			pricePerHour: 3000,
			coverImageId: 'image-1',
			imagesIds: [],
			sportIds: ['soccer', 'invalid-sport'],
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
			weekDays: [1, 3, 5],
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
		expect(courtsRepository.items).toHaveLength(0);
	});
});
