import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryReviewsRepository } from 'test/unit/repositories/in-memory-court-reviews-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Review } from '../../enterprise/entities/review';
import { ListCourtReviewsUseCase } from './list-court-reviews';

let courtsRepository: InMemoryCourtsRepository;
let reviewsRepository: InMemoryReviewsRepository;

let sut: ListCourtReviewsUseCase;

describe('List court reviews use case', () => {
	beforeEach(() => {
		courtsRepository = new InMemoryCourtsRepository(new InMemoryCourtImagesRepository());
		reviewsRepository = new InMemoryReviewsRepository();

		sut = new ListCourtReviewsUseCase(courtsRepository, reviewsRepository);
	});

	it('should be able to list court reviews', async () => {
		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 1',
					coverImage: null,
					address: 'Street 1',
					latitude: -23.4567,
					longitude: -46.4567,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-1'),
			),
		);

		await reviewsRepository.create(
			Review.create({
				courtId: new UniqueEntityID('court-1'),
				authorId: new UniqueEntityID('user-1'),
				comment: 'Great court',
				rating: 5,
			}),
		);

		await reviewsRepository.create(
			Review.create({
				courtId: new UniqueEntityID('court-1'),
				authorId: new UniqueEntityID('user-2'),
				comment: 'Nice place',
				rating: 4,
			}),
		);

		await reviewsRepository.create(
			Review.create({
				courtId: new UniqueEntityID('court-2'),
				authorId: new UniqueEntityID('user-3'),
				comment: 'Another court',
				rating: 3,
			}),
		);

		const result = await sut.execute({
			courtId: 'court-1',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.reviewsList.data).toHaveLength(2);
			expect(result.value.reviewsList.data.map((review) => review.comment)).toEqual([
				'Great court',
				'Nice place',
			]);
			expect(result.value.reviewsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});

	it('should not be able to list reviews from a non-existing court', async () => {
		const result = await sut.execute({
			courtId: 'non-existing-court-id',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
