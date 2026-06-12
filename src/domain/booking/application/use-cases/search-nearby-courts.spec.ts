import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
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
		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-1'),
				name: 'Paulista Court',
				coverImage: null,
				address: 'Paulista Avenue, 100',
				latitude: -23.5613,
				longitude: -46.6565,
				pricePerHour: Cash.fromCents(3000),
				images: new CourtImagesList([]),
			}),
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
			expect(result.value.courtsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});
});
