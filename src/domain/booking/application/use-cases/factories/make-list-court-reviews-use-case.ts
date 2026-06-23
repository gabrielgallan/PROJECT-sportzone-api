import { repositories } from '@/infra/database';
import { ListCourtReviewsUseCase } from '../list-court-reviews';

export function makeListCourtReviewsUseCase() {
	const listCourtReviewsUseCase = new ListCourtReviewsUseCase(
		repositories.courts,
		repositories.reviews,
	);

	return listCourtReviewsUseCase;
}
