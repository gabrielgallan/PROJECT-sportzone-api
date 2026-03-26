import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

enum UserRole {
	MEMBER = "MEMBER",
	ADMIN = "ADMIN",
}

export interface UserProps {
	role: UserRole;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
	static create(
		props: Optional<UserProps, "createdAt" | "role">,
		id?: UniqueEntityID,
	) {
		const user = new User(
			{
				...props,
				role: props.role ?? UserRole.MEMBER,
				createdAt: props.createdAt ?? new Date(),
				updatedAt: props.updatedAt ?? null,
			},
			id,
		);

		return user;
	}

	// => Getters
	get role() {
		return this.props.role;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	// => Setters

	// => Methods
	private touch() {
		this.props.updatedAt = new Date();
	}
}
