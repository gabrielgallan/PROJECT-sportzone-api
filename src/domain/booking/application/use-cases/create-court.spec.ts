import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CreateCourtUseCase } from './create-court';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let courtOpeningHoursRepository: InMemoryCourtOpeningHoursRepository;
let imagesRepository: InMemoryImagesRepository;
let sut: CreateCourtUseCase;

describe('Create court use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		courtOpeningHoursRepository = new InMemoryCourtOpeningHoursRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new CreateCourtUseCase(courtsRepository, courtOpeningHoursRepository);
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
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
			weekDays: [1, 3, 5],
		});

		expect(result.isRight()).toBe(true);
		expect(courtsRepository.items).toHaveLength(1);
		expect(courtsRepository.items[0].name).toBe('Sport Court 1');
		expect(courtsRepository.items[0].coverImage).toBeInstanceOf(CourtImage);
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
});
