import { repositories } from '@/infra/database';
import { GetCourtDetailsUseCase } from '../get-court-details';

export function makeGetCourtDetailsUseCase() {
	const getCourtDetailsUseCase = new GetCourtDetailsUseCase(repositories.courts);

	return getCourtDetailsUseCase;
}
