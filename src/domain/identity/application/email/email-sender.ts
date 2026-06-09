import type { Invite } from '../../enterprise/entities/invite';
import type { Organization } from '../../enterprise/entities/organization';

export interface EmailSender {
	sendRecoveryCode(to: string, code: string): Promise<void>;
	sendInvite(to: string, invite: Invite, organization: Organization): Promise<void>;
}
