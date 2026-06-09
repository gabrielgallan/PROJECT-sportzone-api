import type { OrganizationWithRole } from '@/domain/identity/enterprise/entities/value-objects/organization-with-role';

export class OrganizationWithRolePresenter {
	static toHTTP(organizationWithRole: OrganizationWithRole) {
		const organization = organizationWithRole.organization;

		return {
			id: organization.id.toString(),
			name: organization.name,
			slug: organization.slug.value,
			avatarUrl: organization.avatarUrl ?? null,
			role: organizationWithRole.role,
			createdAt: organization.createdAt,
			updatedAt: organization.updatedAt ?? null,
		};
	}
}
