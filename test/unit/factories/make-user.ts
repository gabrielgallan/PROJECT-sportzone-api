import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
	User,
	type UserProps,
} from "@/domain/identity/enterprise/entities/user";
import { faker } from "@faker-js/faker";
import { HasherStup } from "test/stubs/hasher";

const hasher = new HasherStup();

export async function makeUser(
	override: Partial<UserProps> = {},
	id?: UniqueEntityID,
) {
	const user = User.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			passwordHash: await hasher.generate(
				faker.string.hexadecimal({
					length: 10,
				}),
			),
			...override,
		},
		id,
	);

	return user;
}
