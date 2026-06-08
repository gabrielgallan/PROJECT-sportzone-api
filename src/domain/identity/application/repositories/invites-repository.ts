import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Invite } from '../../enterprise/entities/invite';

export interface InvitesRepository {
	create(invite: Invite): Promise<void>;
	findById(inviteId: string): Promise<Invite | null>;
	findManyByUserEmail(email: string, pagination: PaginationInput): Promise<PaginatedList<Invite[]>>;
	save(invite: Invite): Promise<void>;
}
