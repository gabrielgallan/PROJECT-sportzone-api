import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export enum MemberRole {
	MEMBER = "MEMBER",
	OWNER = "OWNER",
	BILLING = "BILLING",
}

export interface MemberProps {
	userId: UniqueEntityID;
	organizationId: UniqueEntityID;
	role: MemberRole;
	createdAt: Date;
}

export class Member extends Entity<MemberProps> {
	static create(
		props: Optional<MemberProps, "createdAt">,
		id?: UniqueEntityID,
	) {
		const member = new Member(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return member;
	}

	// Getters
	get userId() {
		return this.props.userId;
	}

	get organizationId() {
		return this.props.organizationId;
	}

	get role() {
		return this.props.role;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	// Setters
	set role(role: MemberRole) {
		this.props.role = role;
	}

	// Methods
}
