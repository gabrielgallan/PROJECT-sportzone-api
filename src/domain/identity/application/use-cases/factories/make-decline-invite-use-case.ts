import { repositories } from '@/infra/database';
import { DeclineInviteUseCase } from '../decline-invite';

export function makeDeclineInviteUseCase() {
	const declineInviteUseCase = new DeclineInviteUseCase(
		repositories.users,
		repositories.invites,
		repositories.organizations,
	);

	return declineInviteUseCase;
}
