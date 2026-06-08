import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import { MemberRole } from "../../enterprise/entities/member";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { InvalidMembershipRoleError } from "./errors/invalid-membership-role-error";

interface UpdateMembershipRoleUseCaseRequest {
	userId: string;
	organizationId: string;
	memberId: string;
	role: MemberRole;
}

type UpdateMembershipRoleUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError | InvalidMembershipRoleError,
	null
>;

export class UpdateMembershipRoleUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		organizationId,
		memberId,
		role,
	}: UpdateMembershipRoleUseCaseRequest): Promise<UpdateMembershipRoleUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (organization.ownerId.toString() !== user.id.toString()) {
			return left(new InsufficientPermissionsError());
		}

		if (role === MemberRole.OWNER) {
			return left(new InvalidMembershipRoleError());
		}

		const member = await this.membersRepository.findById(memberId);

		if (!member || member.organizationId.toString() !== organizationId) {
			return left(new ResourceNotFoundError());
		}

		member.role = role;

		await this.membersRepository.save(member);

		return right(null);
	}
}
