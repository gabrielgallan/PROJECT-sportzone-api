import type { Pagination } from "@/core/types/pagination";
import type { MembersRepository } from "@/domain/identity/application/repositories/members-repository";
import type { Member } from "@/domain/identity/enterprise/entities/member";
import { MemberWithProfile } from "@/domain/identity/enterprise/entities/value-objects/member-with-profile";
import type { InMemoryUsersRepository } from "./in-memory-users-repository";

export class InMemoryMembersRepository implements MembersRepository {
	public items: Member[] = [];

	constructor(private usersRepository: InMemoryUsersRepository) {}

	async create(member: Member) {
		this.items.push(member);

		return;
	}

	async listByOrganizationId(organizationId: string, pagination: Pagination) {
		const { page, limit } = pagination;

		const members = this.items.filter(
			(m) => m.organizationId.toString() === organizationId,
		);

		const membersWithProfile = members.map((member) => {
			const user = this.usersRepository.items.find((user) =>
				user.id.equals(member.userId),
			);

			if (!user) {
				throw new Error(
					`User with ID ${member.userId.toString()} does not exists`,
				);
			}

			return MemberWithProfile.create({
				user: {
					id: user.id.toString(),
					name: user.name,
					email: user.email,
					avatarUrl: user.avatarUrl,
				},
				membership: {
					role: member.role,
					createdAt: member.createdAt,
				},
			});
		});

		const paginated = membersWithProfile
			.sort(
				(a, b) =>
					b.membership.createdAt.getTime() - a.membership.createdAt.getTime(),
			)
			.slice((page - 1) * limit, page * limit);

		return paginated;
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
				(m) =>
					m.userId.toString() === userId &&
					m.organizationId.toString() === organizationId,
			) ?? null;

		return member;
	}

	async save(member: Member) {
		const memberIndex = this.items.findIndex(
			(m) => m.id.toString() === member.id.toString(),
		);

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
