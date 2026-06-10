import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { MembersRepository } from '../repositories/members-repository';
import type { OrganizationsRepository } from '../repositories/organizations-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';

interface RemoveMembershipUseCaseRequest {
	userId: string;
	organizationSlug: string;
	memberId: string;
}

type RemoveMembershipUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	null
>;

export class RemoveMembershipUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		organizationSlug,
		memberId,
	}: RemoveMembershipUseCaseRequest): Promise<RemoveMembershipUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const organization = await this.organizationsRepository.findBySlug(organizationSlug);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (organization.ownerId.toString() !== user.id.toString()) {
			return left(new InsufficientPermissionsError());
		}

		const member = await this.membersRepository.findById(memberId);

		if (!member) {
			return left(new ResourceNotFoundError());
		}

		await this.membersRepository.delete(member);

		return right(null);
	}
}
