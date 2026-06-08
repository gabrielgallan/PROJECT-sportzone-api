import type { Invite } from "../../enterprise/entities/invite";

export interface EmailSender {
	sendRecoveryCode(to: string, code: string): Promise<void>;
	sendInvite(to: string, invite: Invite): Promise<void>;
}
