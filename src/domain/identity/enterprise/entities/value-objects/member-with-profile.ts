import { ValueObject } from "@/core/entities/value-object";
import type { MemberRole } from "../member";

interface MemberWithProfileProps {
	user: {
		id: string;
		name?: string | null;
		email: string;
		avatarUrl?: string | null;
	};
	membership: {
		role: MemberRole;
		createdAt: Date;
	};
}

export class MemberWithProfile extends ValueObject<MemberWithProfileProps> {
	static create(props: MemberWithProfileProps) {
		return new MemberWithProfile(props);
	}

	get user() {
		return this.props.user;
	}

	get membership() {
		return this.props.membership;
	}
}
