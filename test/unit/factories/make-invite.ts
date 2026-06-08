import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
	Invite,
	type InviteProps,
} from "@/domain/identity/enterprise/entities/invite";

export async function makeInvite(
	override: Partial<InviteProps> = {},
	id?: UniqueEntityID,
) {
	const invite = Invite.create(
		{
			authorId: new UniqueEntityID(),
			organizationId: new UniqueEntityID(),
			email: faker.internet.email(),
			...override,
		},
		id,
	);

	return invite;
}
