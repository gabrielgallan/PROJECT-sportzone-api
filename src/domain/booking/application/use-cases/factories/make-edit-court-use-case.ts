import { repositories } from '@/infra/database';
import { EditCourtUseCase } from '../edit-court';

export function makeEditCourtUseCase() {
	const editCourtUseCase = new EditCourtUseCase(
		repositories.courts,
		repositories.courtImages,
		repositories.courtOpeningHours,
	);

	return editCourtUseCase;
}
