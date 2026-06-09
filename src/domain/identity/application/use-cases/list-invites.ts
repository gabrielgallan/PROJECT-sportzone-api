import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Invite } from '../../enterprise/entities/invite';
import type { InvitesRepository } from '../repositories/invites-repository';
import type { UsersRepository } from '../repositories/users-repository';

interface ListInvitesUseCaseRequest {
	userId: string;
	pagination?: PaginationInput;
}

type ListInvitesUseCaseResponse = Either<
	ResourceNotFoundError,
	{ invites: PaginatedList<Invite[]> }
>;

export class ListInvitesUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private invitesRepository: InvitesRepository,
	) {}

	async execute({
		userId,
		pagination = { page: 1, limit: 10 },
	}: ListInvitesUseCaseRequest): Promise<ListInvitesUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const invites = await this.invitesRepository.findManyByUserEmail(user.email, pagination);

		return right({
			invites,
		});
	}
}
