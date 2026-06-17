import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Image } from '../../enterprise/entities/image';
import { SearchCourtsUseCase } from './search-courts';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository;

let sut: SearchCourtsUseCase;

describe('Search courts use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new SearchCourtsUseCase(courtsRepository);
	});

	it('should be able to search courts by name and address', async () => {
		await imagesRepository.create(
			Image.create(
				{
					title: 'Arena cover',
					url: 'https://example.com/arena-cover.jpg',
				},
				new UniqueEntityID('image-1'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Arena Sport Center',
					description: 'Indoor court',
					coverImage: CourtImage.create({
						courtId: new UniqueEntityID('court-1'),
						imageId: new UniqueEntityID('image-1'),
					}),
					address: 'Paulista Avenue, 100',
					latitude: -23.5613,
					longitude: -46.6565,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
					rating: 4.5,
				},
				new UniqueEntityID('court-1'),
			),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-2'),
				name: 'Arena Beach Club',
				coverImage: null,
				address: 'Copacabana Street, 200',
				latitude: -22.9711,
				longitude: -43.1822,
				pricePerHour: Cash.fromCents(4000),
				images: new CourtImagesList([]),
			}),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-3'),
				name: 'Mountain Court',
				coverImage: null,
				address: 'Paulista Avenue, 300',
				latitude: -23.5631,
				longitude: -46.6544,
				pricePerHour: Cash.fromCents(5000),
				images: new CourtImagesList([]),
			}),
		);

		const result = await sut.execute({
			courtName: 'arena',
			courtAddress: 'paulista',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.courtsList.data).toHaveLength(1);
			expect(result.value.courtsList.data[0].courtId).toBe('court-1');
			expect(result.value.courtsList.data[0].name).toBe('Arena Sport Center');
			expect(result.value.courtsList.data[0].description).toBe('Indoor court');
			expect(result.value.courtsList.data[0].pricePerHour).toBe(3000);
			expect(result.value.courtsList.data[0].rating).toBe(4.5);
			expect(result.value.courtsList.data[0].coverImage?.id.toString()).toBe('image-1');
			expect(result.value.courtsList.data[0].coverImage?.url).toBe(
				'https://example.com/arena-cover.jpg',
			);
			expect(result.value.courtsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 1,
			});
		}
	});
});
