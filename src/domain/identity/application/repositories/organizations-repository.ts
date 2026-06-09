import type { Organization } from "../../enterprise/entities/organization";

export interface OrganizationsRepository {
	create(organization: Organization): Promise<void>;
	findById(organizationId: string): Promise<Organization | null>;
	findBySlug(slug: string): Promise<Organization | null>
	findManyByIds(organizationIds: string[]): Promise<Organization[]>;
	save(organization: Organization): Promise<void>;
}
