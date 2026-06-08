import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import type { Pagination } from "@/core/types/pagination";
import type { MemberWithProfile } from "../../enterprise/entities/value-objects/member-with-profile";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";

interface ListOrganizationMembersUseCaseRequest {
	userId: string;
	organizationId: string;
	pagination: Pagination;
}

type ListOrganizationMembersUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	{ members: MemberWithProfile[] }
>;

export class ListOrganizationMembersUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		organizationId,
		pagination,
	}: ListOrganizationMembersUseCaseRequest): Promise<ListOrganizationMembersUseCaseResponse> {
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

		const membersWithProfile =
			await this.membersRepository.listByOrganizationId(
				organizationId,
				pagination,
			);

		return right({
			members: membersWithProfile,
		});
	}
}
