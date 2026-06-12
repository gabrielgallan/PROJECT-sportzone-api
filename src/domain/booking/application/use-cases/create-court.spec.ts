import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CreateCourtUseCase } from './create-court';

let sut: CreateCourtUseCase;

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository

describe('Create court use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new CreateCourtUseCase(courtsRepository);
	});

	it('should be able to create court', async () => {
		const result = await sut.execute({
			organizationId: 'org-1',
			name: 'Sport Court 1',
			address: 'Some Street, 2',
			latitude: -23.4567,
			longitude: -46.4567,
			pricePerHour: 3000,
			coverImageId: 'image-1',
			imagesIds: [],
		});

		expect(result.isRight()).toBe(true);

		expect(courtsRepository.items).toHaveLength(1);
		expect(courtsRepository.items[0].name).toBe('Sport Court 1');
		expect(courtsRepository.items[0].organizationId.toString()).toBe('org-1');
		expect(courtsRepository.items[0].address).toBe('Some Street, 2');
		expect(courtsRepository.items[0].pricePerHour.toCents()).toBe(3000);
		expect(courtsRepository.items[0].coverImage).toBeInstanceOf(CourtImage);
	});
});
