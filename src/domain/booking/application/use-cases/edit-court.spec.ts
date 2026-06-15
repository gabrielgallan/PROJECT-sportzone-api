import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { CourtOpeningHour } from '../../enterprise/entities/value-objects/court-opening-hour';
import { EditCourtUseCase } from './edit-court';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let courtOpeningHoursRepository: InMemoryCourtOpeningHoursRepository;
let imagesRepository: InMemoryImagesRepository;
let sut: EditCourtUseCase;

describe('Edit court use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		courtOpeningHoursRepository = new InMemoryCourtOpeningHoursRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new EditCourtUseCase(
			courtsRepository,
			courtImagesRepository,
			courtOpeningHoursRepository,
		);
	});

	it('should be able to edit a court and recreate opening hours', async () => {
		const court = Court.create(
			{
				organizationId: new UniqueEntityID('org-1'),
				name: 'Old court name',
				description: 'Old description',
				coverImage: null,
				address: 'Some Street, 2',
				latitude: -23.4567,
				longitude: -46.4567,
				pricePerHour: Cash.fromCents(3000),
				images: new CourtImagesList([]),
			},
			new UniqueEntityID('court-1'),
		);

		await courtsRepository.create(court);
		await courtImagesRepository.createMany([
			CourtImage.create({
				courtId: court.id,
				imageId: new UniqueEntityID('image-1'),
			}),
		]);
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		]);

		const result = await sut.execute({
			courtId: 'court-1',
			name: 'New court name',
			description: 'New description',
			imagesIds: ['image-2', 'image-3'],
			opensAtInMinutes: 9 * 60,
			closesAtInMinutes: 21 * 60,
			weekDays: [2, 4],
		});

		expect(result.isRight()).toBe(true);
		expect(courtsRepository.items[0].name).toBe('New court name');
		expect(courtsRepository.items[0].description).toBe('New description');
		expect(courtImagesRepository.items.map((image) => image.imageId.toString())).toEqual([
			'image-2',
			'image-3',
		]);
		expect(courtOpeningHoursRepository.items.map((item) => item.weekDay)).toEqual([2, 4]);
		expect(courtOpeningHoursRepository.items.map((item) => item.opensAtInMinutes)).toEqual([
			9 * 60,
			9 * 60,
		]);
	});

	it('should replace previous images and opening hours with the new payload', async () => {
		const court = Court.create(
			{
				organizationId: new UniqueEntityID('org-1'),
				name: 'Old court name',
				description: 'Old description',
				coverImage: null,
				address: 'Some Street, 2',
				latitude: -23.4567,
				longitude: -46.4567,
				pricePerHour: Cash.fromCents(3000),
				images: new CourtImagesList([]),
			},
			new UniqueEntityID('court-1'),
		);

		await courtsRepository.create(court);
		await courtImagesRepository.createMany([
			CourtImage.create({
				courtId: court.id,
				imageId: new UniqueEntityID('image-1'),
			}),
			CourtImage.create({
				courtId: court.id,
				imageId: new UniqueEntityID('image-2'),
			}),
		]);
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 0,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 6,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		]);

		await sut.execute({
			courtId: 'court-1',
			name: 'New court name',
			description: 'New description',
			imagesIds: ['image-3'],
			opensAtInMinutes: 10 * 60,
			closesAtInMinutes: 20 * 60,
			weekDays: [1, 3, 5],
		});

		expect(courtImagesRepository.items.map((image) => image.imageId.toString())).toEqual([
			'image-3',
		]);
		expect(courtOpeningHoursRepository.items.map((item) => item.weekDay)).toEqual([1, 3, 5]);
	});

	it('should not be able to edit a non-existing court', async () => {
		const result = await sut.execute({
			courtId: 'non-existing-court-id',
			name: 'New court name',
			description: 'New description',
			imagesIds: ['image-2'],
			opensAtInMinutes: 9 * 60,
			closesAtInMinutes: 21 * 60,
			weekDays: [1, 3],
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
