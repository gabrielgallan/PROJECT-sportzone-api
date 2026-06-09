import { Resend } from 'resend';
import type { EmailSender } from '@/domain/identity/application/email/email-sender';
import type { Invite } from '@/domain/identity/enterprise/entities/invite';
import type { Organization } from '@/domain/identity/enterprise/entities/organization';
import { env } from '@/infra/env';
import { BadGatewayError } from '@/infra/http/errors/bad-gateway-error';
import { organizationInviteEmail } from '../templates/invite-email';
import { recoveryCodeEmail } from '../templates/recovery-code-email';

export class ResendEmailSender implements EmailSender {
	private resend: Resend = new Resend(env.RESEND_API_KEY);

	async sendRecoveryCode(to: string, code: string) {
		const recoverUrl = `${env.WEB_URL}/auth/reset-password?code=${code}`;

		const { subject, text, html } = recoveryCodeEmail(recoverUrl);

		const { error } = await this.resend.emails.send({
			from: `"Sportzone" <onboarding@resend.dev>`,
			to,
			subject,
			text,
			html,
		});

		if (error) {
			throw new BadGatewayError(`Failed to send E-mail with Resend. ${error.message}`);
		}
	}

	async sendInvite(to: string, invite: Invite, organization: Organization) {
		const inviteUrl = `${env.WEB_URL}/invite?id=${invite.id.toString()}`;

		const { subject, text, html } = organizationInviteEmail(invite, organization, inviteUrl);

		const { error } = await this.resend.emails.send({
			from: `"Sportzone" <onboarding@resend.dev>`,
			to,
			subject,
			text,
			html,
		});

		if (error) {
			throw new BadGatewayError(`Failed to send E-mail with Resend. ${error.message}`);
		}
	}
}
