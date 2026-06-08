import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import { Member } from "../../enterprise/entities/member";
import type { InvitesRepository } from "../repositories/invites-repository";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { InviteAccessDeniedError } from "./errors/invite-access-denied-error";

interface AcceptInviteUseCaseRequest {
	userId: string;
	inviteId: string;
}

type AcceptInviteUseCaseResponse = Either<
	ResourceNotFoundError | InviteAccessDeniedError,
	null
>;

export class AcceptInviteUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private invitesRepository: InvitesRepository,
		private membersRepository: MembersRepository,
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		userId,
		inviteId,
	}: AcceptInviteUseCaseRequest): Promise<AcceptInviteUseCaseResponse> {
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

		const membership = Member.create({
			userId: user.id,
			organizationId: organization.id,
			role: invite.role,
		});

		await this.membersRepository.create(membership);

		invite.accept();

		await this.invitesRepository.save(invite);

		return right(null);
	}
}
