import { repositories } from '@/infra/database';
import { FetchSportsUseCase } from '../fetch-sports';

export function makeFetchSportsUseCase() {
	const fetchSportsUseCase = new FetchSportsUseCase(
		repositories.sports
	);

	return fetchSportsUseCase;
}
