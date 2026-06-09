import { repositories } from '@/infra/database';
import { RemoveMembershipUseCase } from '../remove-membership';

export function makeRemoveMembershipUseCase() {
	const removeMembershipUseCase = new RemoveMembershipUseCase(
		repositories.users,
		repositories.members,
		repositories.organizations,
	);

	return removeMembershipUseCase;
}
