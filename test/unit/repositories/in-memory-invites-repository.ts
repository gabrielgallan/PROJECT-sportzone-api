import type { PaginationInput } from '@/core/types/pagination';
import type { InvitesRepository } from '@/domain/identity/application/repositories/invites-repository';
import type { Invite } from '@/domain/identity/enterprise/entities/invite';
import { InviteDetails } from '@/domain/identity/enterprise/entities/value-objects/invite-details';
import type { InMemoryOrganizationsRepository } from './in-memory-organizations-reporitory';
import type { InMemoryUsersRepository } from './in-memory-users-repository';

export class InMemoryInvitesRepository implements InvitesRepository {
	public items: Invite[] = [];

	constructor(
		private usersRepository: InMemoryUsersRepository,
		private organizationsRepository: InMemoryOrganizationsRepository,
	) {}

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
			.slice((page - 1) * limit, page * limit);

		const invitesWithDetails = paginated.map((invite) => {
			const organization = this.organizationsRepository.items.find((org) =>
				org.id.equals(invite.organizationId),
			);
			const author = this.usersRepository.items.find((user) => user.id.equals(invite.authorId));

			if (!organization || !author) {
				throw new Error(`Invalid invite, ID: ${invite.id}`);
			}

			return InviteDetails.create({
				inviteId: invite.id.toString(),
				organization: {
					name: organization.name,
					avatarUrl: organization.avatarUrl ?? null,
					authorName: author.name ?? null,
				},
				status: invite.status,
				role: invite.role,
				createdAt: invite.createdAt,
			});
		});

		return {
			data: invitesWithDetails,
			meta: {
				page,
				limit,
				total: invites.length,
			},
		};
	}

	async findByEmailAndOrganizationId(email: string, organizationId: string) {
		const invite = this.items.find(
			(invite) => invite.email === email && invite.organizationId.toString() === organizationId,
		);

		return invite ?? null;
	}

	async save(invite: Invite) {
		const inviteIndex = this.items.findIndex((i) => i.id.toString() === invite.id.toString());

		if (inviteIndex >= 0) {
			this.items[inviteIndex] = invite;
		}

		return;
	}
}
