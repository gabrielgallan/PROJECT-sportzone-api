import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import type { MemberRole } from "../../enterprise/entities/member";
import type { Organization } from "../../enterprise/entities/organization";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";

interface ListUserOrganizationsUseCaseRequest {
	userId: string;
}

type ListUserOrganizationsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		organizations: Array<{
			organization: Organization;
			role: MemberRole;
		}>;
	}
>;

export class ListUserOrganizationsUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
	}: ListUserOrganizationsUseCaseRequest): Promise<ListUserOrganizationsUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const memberships = await this.membersRepository.findManyByUserId(userId);
		
		const organizationIds = memberships.map((membership) =>
			membership.organizationId.toString(),
		);

		const organizations =
			await this.organizationsRepository.findManyByIds(organizationIds);

		const organizationsWithRoles = memberships.flatMap((membership) => {
			const organization = organizations.find(
				(item) =>
					item.id.toString() === membership.organizationId.toString(),
			);

			if (!organization) {
				return [];
			}

			return [
				{
					organization,
					role: membership.role,
				},
			];
		});

		return right({
			organizations: organizationsWithRoles,
		});
	}
}
