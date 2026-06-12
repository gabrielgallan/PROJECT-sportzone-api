import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { GetCourtDetailsUseCase } from './get-court-details';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository;

let sut: GetCourtDetailsUseCase;

describe('Get court details use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new GetCourtDetailsUseCase(courtsRepository);
	});

	it('should be able to get court details', async () => {
		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 1',
					description: 'Indoor court',
					coverImage: null,
					address: 'Street 1',
					latitude: -23.4567,
					longitude: -46.4567,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
					rating: 4.5,
					reviewsCount: 8,
				},
				new UniqueEntityID('court-1'),
			),
		);

		const result = await sut.execute({
			courtId: 'court-1',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.court.courtId).toBe('court-1');
			expect(result.value.court.name).toBe('Court 1');
			expect(result.value.court.description).toBe('Indoor court');
			expect(result.value.court.rating).toBe(4.5);
			expect(result.value.court.reviewsCount).toBe(8);
		}
	});

	it('should not be able to get details from a non-existing court', async () => {
		const result = await sut.execute({
			courtId: 'non-existing-court-id',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
