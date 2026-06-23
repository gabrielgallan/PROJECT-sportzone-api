import { repositories } from '@/infra/database';
import { SearchCourtsUseCase } from '../search-courts';

export function makeSearchCourtsUseCase() {
	const searchCourtsUseCase = new SearchCourtsUseCase(repositories.courts);

	return searchCourtsUseCase;
}
