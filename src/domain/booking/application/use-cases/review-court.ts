import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import { Review } from '../../enterprise/entities/review';
import type { CourtsRepository } from '../repositories/courts-repository';
import type { ReviewsRepository } from '../repositories/reviews-repository';

interface ReviewCourtUseCaseRequest {
	userId: string;
	courtId: string;
	comment: string;
	rating: number;
}

type ReviewCourtUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		review: Review;
	}
>;

export class ReviewCourtUseCase {
	constructor(
		private courtsRepository: CourtsRepository, private reviewsRepository: ReviewsRepository,
	) {}

	async execute({
		userId,
		courtId,
		comment,
		rating,
	}: ReviewCourtUseCaseRequest): Promise<ReviewCourtUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		const ratingRounded = Math.min(Math.max(Math.round(rating), 1), 5);

		const review = Review.create({
			courtId: court.id,
			authorId: new UniqueEntityID(userId),
			comment,
			rating: ratingRounded,
		});

		await this.reviewsRepository.create(review);

		court.addRating(ratingRounded);

		await this.courtsRepository.save(court);

		return right({
			review,
		});
	}
}
