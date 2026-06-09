import { repositories } from '@/infra/database';
import { ListInvitesUseCase } from '../list-invites';

export function makeListInvitesUseCase() {
	const listInvitesUseCase = new ListInvitesUseCase(
		repositories.users,
		repositories.invites,
	);

	return listInvitesUseCase;
}
