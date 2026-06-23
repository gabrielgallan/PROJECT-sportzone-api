import { repositories } from '@/infra/database';
import { CreateCourtUseCase } from '../create-court';

export function makeCreateCourtUseCase() {
	const createCourtUseCase = new CreateCourtUseCase(
		repositories.courts,
		repositories.courtOpeningHours,
	);

	return createCourtUseCase;
}
