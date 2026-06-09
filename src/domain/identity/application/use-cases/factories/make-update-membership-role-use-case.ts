import { repositories } from '@/infra/database';
import { UpdateMembershipRoleUseCase } from '../update-membership-role';

export function makeUpdateMembershipRoleUseCase() {
	const updateMembershipRoleUseCase = new UpdateMembershipRoleUseCase(
		repositories.users,
		repositories.members,
		repositories.organizations,
	);

	return updateMembershipRoleUseCase;
}
