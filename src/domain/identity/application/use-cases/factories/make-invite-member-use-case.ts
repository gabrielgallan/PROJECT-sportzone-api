import { repositories } from '@/infra/database';
import { services as email } from '@/infra/email';
import { InviteMemberUseCase } from '../invite-member';

export function makeInviteMemberUseCase() {
	const inviteMemberUseCase = new InviteMemberUseCase(
		repositories.users,
		repositories.invites,
		repositories.organizations,
		email.emailSender,
	);

	return inviteMemberUseCase;
}
