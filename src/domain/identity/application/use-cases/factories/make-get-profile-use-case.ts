import { repositories } from '@/infra/database';
import { GetProfileUseCase } from '../get-profile';

export function makeGetProfileUseCase() {
	const getProfileUseCase = new GetProfileUseCase(repositories.users);

	return getProfileUseCase;
}
