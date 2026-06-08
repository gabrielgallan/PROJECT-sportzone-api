import type { Invite } from "../../enterprise/entities/invite";

export interface InvitesRepository {
	create(invite: Invite): Promise<void>;
	findById(inviteId: string): Promise<Invite | null>;
	findManyByUserEmail(email: string): Promise<Invite[]>;
	save(invite: Invite): Promise<void>;
}
