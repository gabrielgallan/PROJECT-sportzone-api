import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { EditCourtUseCase } from './edit-court';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;

let sut: EditCourtUseCase;

describe('Edit court use case', () => {
	beforeEach(() => {
		courtsRepository = new InMemoryCourtsRepository();
		courtImagesRepository = new InMemoryCourtImagesRepository();

		sut = new EditCourtUseCase(courtsRepository, courtImagesRepository);
	});

	it('should be able to edit a court', async () => {
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

		const result = await sut.execute({
			courtId: 'court-1',
			name: 'New court name',
			description: 'New description',
			imagesIds: ['image-2', 'image-3'],
		});

		expect(result.isRight()).toBe(true);

		expect(courtsRepository.items[0].name).toBe('New court name');
		expect(courtsRepository.items[0].description).toBe('New description');
		expect(courtsRepository.items[0].images.currentItems).toHaveLength(2);
		expect(
			courtsRepository.items[0].images.currentItems.map((image) => image.imageId.toString()),
		).toEqual(['image-2', 'image-3']);
		expect(courtsRepository.items[0].updatedAt).toEqual(expect.any(Date));
	});

	it('should not be able to edit a non-existing court', async () => {
		const result = await sut.execute({
			courtId: 'non-existing-court-id',
			name: 'New court name',
			description: 'New description',
			imagesIds: ['image-2'],
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
