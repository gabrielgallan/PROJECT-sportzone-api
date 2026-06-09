import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Member } from '../../enterprise/entities/member';
import type { MemberWithProfile } from '../../enterprise/entities/value-objects/member-with-profile';
import type { OrganizationWithRole } from '../../enterprise/entities/value-objects/organization-with-role';

export interface MembersRepository {
	create(member: Member): Promise<void>;
	listByOrganizationId(
		organizationId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<MemberWithProfile[]>>;
	listWithOrganizationByUserId(
		userId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<OrganizationWithRole[]>>;
	findById(memberId: string): Promise<Member | null>;
	findManyByUserId(userId: string): Promise<Member[]>;
	findByUserIdAndOrganizationId(userId: string, organizationId: string): Promise<Member | null>;
	save(member: Member): Promise<void>;
	delete(member: Member): Promise<void>;
}
