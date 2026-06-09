import { repositories } from '@/infra/database';
import { ListUserOrganizationsUseCase } from '../list-user-organizations';

export function makeListUserOrganizationsUseCase() {
	const listUserOrganizationsUseCase = new ListUserOrganizationsUseCase(
		repositories.users,
		repositories.members,
	);

	return listUserOrganizationsUseCase;
}
