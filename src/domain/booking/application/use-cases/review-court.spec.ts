import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { ReviewCourtUseCase } from './review-court';
import { InMemoryCourtReviewsRepository } from 'test/unit/repositories/in-memory-court-reviews-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';

let courtsRepository: InMemoryCourtsRepository;
let courtReviewsRepository: InMemoryCourtReviewsRepository;

let sut: ReviewCourtUseCase;

describe('Review court use case', () => {
	beforeEach(() => {
		courtsRepository = new InMemoryCourtsRepository();
		courtReviewsRepository = new InMemoryCourtReviewsRepository();

		sut = new ReviewCourtUseCase(courtsRepository, courtReviewsRepository);
	});

	it('should be able to review a court', async () => {
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
					rating: 4,
					reviewsCount: 2,
				},
				new UniqueEntityID('court-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			comment: 'Great court',
			rating: 4.7,
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.courtReview.comment).toBe('Great court');
			expect(result.value.courtReview.rating).toBe(5);
			expect(result.value.courtReview.authorId.toString()).toBe('user-1');
			expect(result.value.courtReview.courtId.toString()).toBe('court-1');
		}

		expect(courtReviewsRepository.items).toHaveLength(1);
		expect(courtReviewsRepository.items[0].comment).toBe('Great court');
		expect(courtReviewsRepository.items[0].rating).toBe(5);
		expect(courtsRepository.items[0].rating).toBe(4.33);
		expect(courtsRepository.items[0].reviewsCount).toBe(3);
		expect(courtsRepository.items[0].updatedAt).toEqual(expect.any(Date));
	});

	it('should not be able to review a non-existing court', async () => {
		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'non-existing-court-id',
			comment: 'Great court',
			rating: 5,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
		expect(courtReviewsRepository.items).toHaveLength(0);
	});
});
