import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';

export type UserProps = {};

export class User extends Entity<UserProps> {
	static create(props: UserProps, id?: UniqueEntityID) {
		const user = new User(props, id);

		return user;
	}
}
