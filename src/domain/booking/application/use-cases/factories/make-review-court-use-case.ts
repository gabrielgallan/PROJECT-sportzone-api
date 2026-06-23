import { repositories } from '@/infra/database';
import { ReviewCourtUseCase } from '../review-court';

export function makeReviewCourtUseCase() {
	const reviewCourtUseCase = new ReviewCourtUseCase(repositories.courts, repositories.reviews);

	return reviewCourtUseCase;
}
