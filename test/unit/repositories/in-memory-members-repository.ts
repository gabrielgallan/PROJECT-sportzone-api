import type { PaginationInput } from '@/core/types/pagination';
import type { MembersRepository } from '@/domain/identity/application/repositories/members-repository';
import type { Member } from '@/domain/identity/enterprise/entities/member';
import { MemberWithProfile } from '@/domain/identity/enterprise/entities/value-objects/member-with-profile';
import { OrganizationWithRole } from '@/domain/identity/enterprise/entities/value-objects/organization-with-role';
import type { InMemoryOrganizationsRepository } from './in-memory-organizations-reporitory';
import type { InMemoryUsersRepository } from './in-memory-users-repository';

export class InMemoryMembersRepository implements MembersRepository {
	public items: Member[] = [];

	constructor(
		private usersRepository: InMemoryUsersRepository,
		private organizationsRepository: InMemoryOrganizationsRepository,
	) {}

	async create(member: Member) {
		this.items.push(member);

		return;
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const members = this.items.filter((m) => m.organizationId.toString() === organizationId);

		const paginated = members
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice((page - 1) * limit, page * limit);

		const membersWithProfile = paginated.map((member) => {
			const user = this.usersRepository.items.find((user) => user.id.equals(member.userId));

			if (!user) {
				throw new Error(`User with ID ${member.userId.toString()} does not exists`);
			}

			return MemberWithProfile.create({
				user: {
					id: user.id.toString(),
					name: user.name,
					email: user.email,
					avatarUrl: user.avatarUrl,
				},
				membership: {
					id: member.id.toString(),
					role: member.role,
					createdAt: member.createdAt,
				},
			});
		});

		return {
			data: membersWithProfile,
			meta: {
				page,
				limit,
				total: members.length,
			},
		};
	}

	async listWithOrganizationByUserId(userId: string, { page, limit }: PaginationInput) {
		const memberships = this.items.filter((m) => m.userId.toString() === userId);

		const paginated = memberships.slice((page - 1) * limit, page * limit);

		const membershipsWithOrg = paginated.map((ship) => {
			const organization = this.organizationsRepository.items.find(
				(o) => o.id.toString() === ship.organizationId.toString(),
			);

			if (!organization)
				throw new Error(`Organization ID ${ship.organizationId.toString()} does not exists`);

			return OrganizationWithRole.create({
				role: ship.role,
				organization,
			});
		});

		return {
			data: membershipsWithOrg,
			meta: {
				page,
				limit,
				total: memberships.length,
			},
		};
	}

	async findById(memberId: string) {
		const member = this.items.find((m) => m.id.toString() === memberId);

		return member ?? null;
	}

	async findManyByUserId(userId: string) {
		const members = this.items.filter((m) => m.userId.toString() === userId);

		return members;
	}

	async findByUserIdAndOrganizationId(userId: string, organizationId: string) {
		const member =
			this.items.find(
				(m) => m.userId.toString() === userId && m.organizationId.toString() === organizationId,
			) ?? null;

		return member;
	}

	async save(member: Member) {
		const memberIndex = this.items.findIndex((m) => m.id.toString() === member.id.toString());

		if (memberIndex >= 0) {
			this.items[memberIndex] = member;
		}

		return;
	}

	async delete(member: Member) {
		this.items.filter((m) => m.id.toString() !== member.id.toString());

		return;
	}
}
