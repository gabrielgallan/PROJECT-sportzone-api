import { PaginationInput } from "@/core/types/pagination";
import type { InvitesRepository } from "@/domain/identity/application/repositories/invites-repository";
import type { Invite } from "@/domain/identity/enterprise/entities/invite";

export class InMemoryInvitesRepository implements InvitesRepository {
	public items: Invite[] = [];

	async create(invite: Invite) {
		this.items.push(invite);

		return;
	}

	async findById(inviteId: string) {
		const invite = this.items.find((i) => i.id.toString() === inviteId);

		return invite ?? null;
	}

	async findManyByUserEmail(email: string, { page, limit }: PaginationInput) {
		const invites = this.items.filter((i) => i.email === email);

		const paginated = invites
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)

		return {
			data: paginated,
			meta: {
				page, limit, total: invites.length
			}
		}
	}

	async save(invite: Invite) {
		const inviteIndex = this.items.findIndex(
			(i) => i.id.toString() === invite.id.toString(),
		);

		if (inviteIndex >= 0) {
			this.items[inviteIndex] = invite;
		}

		return;
	}
}
