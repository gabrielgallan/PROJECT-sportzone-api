import { repositories } from '@/infra/database';
import { CreateOrganizationUseCase } from '../create-organization';

export function makeCreateOrganizationUseCase() {
	const createOrganizationUseCase = new CreateOrganizationUseCase(
		repositories.users,
		repositories.organizations,
		repositories.members,
	);

	return createOrganizationUseCase;
}
