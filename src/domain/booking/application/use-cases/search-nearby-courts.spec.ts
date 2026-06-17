import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Image } from '../../enterprise/entities/image';
import { SearchNearbyCourtsUseCase } from './search-nearby-courts';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository;

let sut: SearchNearbyCourtsUseCase;

describe('Search nearby courts use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new SearchNearbyCourtsUseCase(courtsRepository);
	});

	it('should be able to search nearby courts', async () => {
		await imagesRepository.create(
			Image.create(
				{
					title: 'Paulista cover',
					url: 'https://example.com/paulista-cover.jpg',
				},
				new UniqueEntityID('image-1'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Paulista Court',
					description: 'Central court',
					coverImage: CourtImage.create({
						courtId: new UniqueEntityID('court-1'),
						imageId: new UniqueEntityID('image-1'),
					}),
					address: 'Paulista Avenue, 100',
					latitude: -23.5613,
					longitude: -46.6565,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
					rating: 4.2,
				},
				new UniqueEntityID('court-1'),
			),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-2'),
				name: 'Nearby Center Court',
				coverImage: null,
				address: 'Augusta Street, 200',
				latitude: -23.5558,
				longitude: -46.6396,
				pricePerHour: Cash.fromCents(4000),
				images: new CourtImagesList([]),
			}),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-3'),
				name: 'Far Away Court',
				coverImage: null,
				address: 'Downtown Rio, 300',
				latitude: -22.9068,
				longitude: -43.1729,
				pricePerHour: Cash.fromCents(5000),
				images: new CourtImagesList([]),
			}),
		);

		const result = await sut.execute({
			userLatitude: -23.5613,
			userLongitude: -46.6565,
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.courtsList.data).toHaveLength(2);
			expect(result.value.courtsList.data.map((court) => court.name)).toEqual([
				'Paulista Court',
				'Nearby Center Court',
			]);
			expect(result.value.courtsList.data[0].courtId).toBe('court-1');
			expect(result.value.courtsList.data[0].description).toBe('Central court');
			expect(result.value.courtsList.data[0].pricePerHour).toBe(3000);
			expect(result.value.courtsList.data[0].rating).toBe(4.2);
			expect(result.value.courtsList.data[0].coverImage?.id.toString()).toBe('image-1');
			expect(result.value.courtsList.data[0].coverImage?.title).toBe('Paulista cover');
			expect(result.value.courtsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});
});
