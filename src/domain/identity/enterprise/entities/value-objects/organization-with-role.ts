import { ValueObject } from '@/core/entities/value-object';
import type { MemberRole } from '../member';
import type { Organization } from '../organization';

interface OrganizationWithRoleProps {
	organization: Organization;
	role: MemberRole;
}

export class OrganizationWithRole extends ValueObject<OrganizationWithRoleProps> {
	static create(props: OrganizationWithRoleProps) {
		return new OrganizationWithRole(props);
	}

	get organization() {
		return this.props.organization;
	}

	get role() {
		return this.props.role;
	}
}
