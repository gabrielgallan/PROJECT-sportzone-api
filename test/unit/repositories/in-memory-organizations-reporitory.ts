import type { OrganizationsRepository } from "@/domain/identity/application/repositories/organizations-repository";
import type { Organization } from "@/domain/identity/enterprise/entities/organization";

export class InMemoryOrganizationsRepository
	implements OrganizationsRepository
{
	public items: Organization[] = [];

	async create(organization: Organization) {
		this.items.push(organization);

		return;
	}

	async findById(organizationId: string) {
		const organization = this.items.find(
			(o) => o.id.toString() === organizationId,
		);

		return organization ?? null;
	}

	async findManyByIds(organizationIds: string[]) {
		const organizations = this.items.filter((o) =>
			organizationIds.includes(o.id.toString()),
		);

		return organizations;
	}

	async save(organization: Organization) {
		const organizationIndex = this.items.findIndex(
			(o) => o.id.toString() === organization.id.toString(),
		);

		if (organizationIndex >= 0) {
			this.items[organizationIndex] = organization;
		}

		return;
	}
}
