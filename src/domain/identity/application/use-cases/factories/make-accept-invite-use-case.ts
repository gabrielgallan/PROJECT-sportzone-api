import { repositories } from '@/infra/database';
import { AcceptInviteUseCase } from '../accept-invite';

export function makeAcceptInviteUseCase() {
	const acceptInviteUseCase = new AcceptInviteUseCase(
		repositories.users,
		repositories.invites,
		repositories.members,
		repositories.organizations,
	);

	return acceptInviteUseCase;
}
