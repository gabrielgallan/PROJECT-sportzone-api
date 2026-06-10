import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { OrganizationWithRole } from '../../enterprise/entities/value-objects/organization-with-role';
import type { MembersRepository } from '../repositories/members-repository';
import type { UsersRepository } from '../repositories/users-repository';

interface ListUserOrganizationsUseCaseRequest {
	userId: string;
	pagination?: PaginationInput;
}

type ListUserOrganizationsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		organizations: PaginatedList<OrganizationWithRole[]>;
	}
>;

export class ListUserOrganizationsUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private membersRepository: MembersRepository,
	) {}

	async execute({
		userId,
		pagination = { page: 1, limit: 10 },
	}: ListUserOrganizationsUseCaseRequest): Promise<ListUserOrganizationsUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const organizationsWithRoles = await this.membersRepository.listWithOrganizationByUserId(
			userId,
			pagination,
		);

		return right({
			organizations: organizationsWithRoles,
		});
	}
}
