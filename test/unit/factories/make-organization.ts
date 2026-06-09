import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
	Organization,
	type OrganizationProps,
} from "@/domain/identity/enterprise/entities/organization";

export async function makeOrganization(
	override: Partial<OrganizationProps> = {},
	id?: UniqueEntityID,
) {
	const organization = Organization.create(
		{
			ownerId: new UniqueEntityID(),
			name: faker.company.name(),
			...override,
		},
		id,
	);

	return organization;
}
