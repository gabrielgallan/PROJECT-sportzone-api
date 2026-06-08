import type { EmailSender } from "@/domain/identity/application/email/email-sender";
import type { Invite } from "@/domain/identity/enterprise/entities/invite";

export class EmailSenderStub implements EmailSender {
	public emails: { to: string; subject: string; text: string }[] = [];

	sendRecoveryCode(to: string, code: string) {
		this.emails.push({
			to,
			subject: "Recovery Code",
			text: `Your recovery code is: ${code}`,
		});

		return Promise.resolve();
	}

	sendInvite(to: string, invite: Invite) {
		this.emails.push({
			to,
			subject: "New Invite",
			text: `You was invited to join in organization ${invite.organizationId.toString()}`,
		});

		return Promise.resolve();
	}
}
