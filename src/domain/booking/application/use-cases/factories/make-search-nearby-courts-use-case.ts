import { repositories } from '@/infra/database';
import { SearchNearbyCourtsUseCase } from '../search-nearby-courts';

export function makeSearchNearbyCourtsUseCase() {
	const searchNearbyCourtsUseCase = new SearchNearbyCourtsUseCase(repositories.courts);

	return searchNearbyCourtsUseCase;
}
