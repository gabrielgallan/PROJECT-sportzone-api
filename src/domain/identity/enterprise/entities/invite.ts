import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';
import type { MemberRole } from './member';

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface InviteProps {
	authorId: UniqueEntityID;
	organizationId: UniqueEntityID;
	email: string;
	role: MemberRole;
	status: InviteStatus;
	createdAt: Date;
}

export class Invite extends Entity<InviteProps> {
	static create(
		props: Optional<InviteProps, 'createdAt' | 'role' | 'status'>,
		id?: UniqueEntityID,
	) {
		const invite = new Invite(
			{
				...props,
				role: props.role ?? 'MEMBER',
				status: props.status ?? 'PENDING',
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return invite;
	}

	// Getters
	get authorId() {
		return this.props.authorId;
	}

	get organizationId() {
		return this.props.organizationId;
	}

	get email() {
		return this.props.email;
	}

	get role() {
		return this.props.role;
	}

	get status() {
		return this.props.status;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	// Setters

	// Methods
	decline() {
		this.props.status = 'DECLINED';
	}

	accept() {
		this.props.status = 'ACCEPTED';
	}
}
