import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";

interface TransferOwnershipUseCaseRequest {
	userId: string;
	organizationSlug: string;
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
		organizationSlug,
		memberId,
	}: TransferOwnershipUseCaseRequest): Promise<TransferOwnershipUseCaseResponse> {
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

		const currentOwnerMembership =
			await this.membersRepository.findByUserIdAndOrganizationId(
				userId,
				organization.id.toString(),
			);

		if (!currentOwnerMembership) {
			return left(new ResourceNotFoundError());
		}

		const targetMembership = await this.membersRepository.findById(memberId);

		if (
			!targetMembership ||
			targetMembership.organizationId.toString() !== organization.id.toString()
		) {
			return left(new ResourceNotFoundError());
		}

		currentOwnerMembership.role = 'MEMBER';
		targetMembership.role = 'OWNER';
		organization.transferOwnership(targetMembership.userId);

		await this.membersRepository.save(currentOwnerMembership);
		await this.membersRepository.save(targetMembership);
		await this.organizationsRepository.save(organization);

		return right(null);
	}
}
