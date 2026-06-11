import { ValueObject } from '@/core/entities/value-object';
import type { InviteStatus } from '../invite';
import type { MemberRole } from '../member';

interface InviteDetailsProps {
	inviteId: string;
	organization: {
		name: string;
		avatarUrl: string | null;
		authorName: string | null;
	};
	status: InviteStatus;
	role: MemberRole;
	createdAt: Date;
}

export class InviteDetails extends ValueObject<InviteDetailsProps> {
	static create(props: InviteDetailsProps) {
		return new InviteDetails(props);
	}

	get inviteId() {
		return this.props.inviteId;
	}

	get organization() {
		return this.props.organization;
	}

	get status() {
		return this.props.status;
	}

	get role() {
		return this.props.role;
	}

	get createdAt() {
		return this.props.createdAt;
	}
}
