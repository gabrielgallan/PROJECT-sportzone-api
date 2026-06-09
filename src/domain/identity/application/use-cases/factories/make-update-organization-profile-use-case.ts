import { repositories } from '@/infra/database';
import { UpdateOrganizationProfileUseCase } from '../update-organization-profile';

export function makeUpdateOrganizationProfileUseCase() {
	const updateOrganizationProfileUseCase = new UpdateOrganizationProfileUseCase(
		repositories.organizations,
	);

	return updateOrganizationProfileUseCase;
}
