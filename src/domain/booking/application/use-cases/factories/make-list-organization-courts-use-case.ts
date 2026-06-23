import { repositories } from '@/infra/database';
import { ListOrganizationCourtsUseCase } from '../list-organization-courts';

export function makeListOrganizationCourtsUseCase() {
	const listOrganizationCourtsUseCase = new ListOrganizationCourtsUseCase(
		repositories.courts,
	);

	return listOrganizationCourtsUseCase;
}
