import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import { CourtReview } from '../../enterprise/entities/court-review';
import type { CourtReviewsRepository } from '../repositories/court-reviews-repository';
import type { CourtsRepository } from '../repositories/courts-repository';

interface ReviewCourtUseCaseRequest {
	userId: string;
	courtId: string;
	comment: string;
	rating: number;
}

type ReviewCourtUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		courtReview: CourtReview;
	}
>;

export class ReviewCourtUseCase {
	constructor(
		private courtsRepository: CourtsRepository,
		private courtReviewsRepository: CourtReviewsRepository,
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

		const courtReview = CourtReview.create({
			courtId: court.id,
			authorId: new UniqueEntityID(userId),
			comment,
			rating: ratingRounded,
		});

		await this.courtReviewsRepository.create(courtReview);

		court.addRating(ratingRounded);

		await this.courtsRepository.save(court);

		return right({
			courtReview,
		});
	}
}
