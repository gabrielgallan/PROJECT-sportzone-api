import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Invite } from '../../enterprise/entities/invite';
import type { InviteDetails } from '../../enterprise/entities/value-objects/invite-details';

export interface InvitesRepository {
	create(invite: Invite): Promise<void>;
	findById(inviteId: string): Promise<Invite | null>;
	findByEmailAndOrganizationId(email: string, organizationId: string): Promise<Invite | null>;
	findManyByUserEmail(
		email: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<InviteDetails[]>>;
	save(invite: Invite): Promise<void>;
}
