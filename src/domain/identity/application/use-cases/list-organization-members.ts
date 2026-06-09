import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import type { PaginatedList, PaginationInput } from "@/core/types/pagination";
import type { MemberWithProfile } from "../../enterprise/entities/value-objects/member-with-profile";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";

interface ListOrganizationMembersUseCaseRequest {
	userId: string;
	organizationSlug: string;
	pagination?: PaginationInput;
}

type ListOrganizationMembersUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	{ members: PaginatedList<MemberWithProfile[]> }
>;

export class ListOrganizationMembersUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		organizationSlug,
		pagination = { page: 1, limit: 10 },
	}: ListOrganizationMembersUseCaseRequest): Promise<ListOrganizationMembersUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const organization =
			await this.organizationsRepository.findBySlug(organizationSlug);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (organization.ownerId.toString() !== user.id.toString()) {
			return left(new InsufficientPermissionsError());
		}

		const membersWithProfile =
			await this.membersRepository.listByOrganizationId(
				organization.id.toString(),
				pagination,
			);

		return right({
			members: membersWithProfile,
		});
	}
}
