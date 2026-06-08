import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import type { InvitesRepository } from "../repositories/invites-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InviteAccessDeniedError } from "./errors/invite-access-denied-error";

interface DeclineInviteUseCaseRequest {
	userId: string;
	inviteId: string;
}

type DeclineInviteUseCaseResponse = Either<
	ResourceNotFoundError | InviteAccessDeniedError,
	null
>;

export class DeclineInviteUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private invitesRepository: InvitesRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		inviteId,
	}: DeclineInviteUseCaseRequest): Promise<DeclineInviteUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const invite = await this.invitesRepository.findById(inviteId);

		if (!invite) {
			return left(new ResourceNotFoundError());
		}

		const organization = await this.organizationsRepository.findById(
			invite.organizationId.toString(),
		);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (invite.email !== user.email) {
			return left(new InviteAccessDeniedError());
		}

		invite.decline();

		await this.invitesRepository.save(invite);

		return right(null);
	}
}
