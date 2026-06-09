import { repositories } from '@/infra/database';
import { ListOrganizationMembersUseCase } from '../list-organization-members';

export function makeListOrganizationMembersUseCase() {
	const listOrganizationMembersUseCase = new ListOrganizationMembersUseCase(
		repositories.users,
		repositories.members,
		repositories.organizations,
	);

	return listOrganizationMembersUseCase;
}
