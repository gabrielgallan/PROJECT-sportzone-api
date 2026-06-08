import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import { MemberRole } from "../../enterprise/entities/member";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";

interface TransferOwnershipUseCaseRequest {
	userId: string;
	organizationId: string;
	memberId: string;
}

type TransferOwnershipUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	null
>;

export class TransferOwnershipUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		organizationId,
		memberId,
	}: TransferOwnershipUseCaseRequest): Promise<TransferOwnershipUseCaseResponse> {
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

		const currentOwnerMembership =
			await this.membersRepository.findByUserIdAndOrganizationId(
				userId,
				organizationId,
			);

		if (!currentOwnerMembership) {
			return left(new ResourceNotFoundError());
		}

		const targetMembership = await this.membersRepository.findById(memberId);

		if (
			!targetMembership ||
			targetMembership.organizationId.toString() !== organizationId
		) {
			return left(new ResourceNotFoundError());
		}

		currentOwnerMembership.role = MemberRole.MEMBER;
		targetMembership.role = MemberRole.OWNER;
		organization.transferOwnership(targetMembership.userId);

		await this.membersRepository.save(currentOwnerMembership);
		await this.membersRepository.save(targetMembership);
		await this.organizationsRepository.save(organization);

		return right(null);
	}
}
