import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import { Invite } from '../../enterprise/entities/invite';
import type { MemberRole } from '../../enterprise/entities/member';
import type { EmailSender } from '../email/email-sender';
import type { InvitesRepository } from '../repositories/invites-repository';
import type { OrganizationsRepository } from '../repositories/organizations-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { ResourceAlreadyExistsError } from './errors/resource-already-exists-error';

interface InviteMemberUseCaseRequest {
	userId: string;
	organizationSlug: string;
	invitedEmail: string;
	role: MemberRole;
}

type InviteMemberUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	null
>;

export class InviteMemberUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private invitesRepository: InvitesRepository,
		private organizationsRepository: OrganizationsRepository,
		private emailSender: EmailSender,
	) {}

	async execute({
		userId,
		organizationSlug,
		invitedEmail,
		role,
	}: InviteMemberUseCaseRequest): Promise<InviteMemberUseCaseResponse> {
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

		const emailAlreadyInvited = await this.invitesRepository.findByEmailAndOrganizationId(
			invitedEmail,
			organization.id.toString(),
		);

		if (emailAlreadyInvited) {
			return left(new ResourceAlreadyExistsError());
		}

		const invite = Invite.create({
			authorId: user.id,
			organizationId: organization.id,
			email: invitedEmail,
			role,
		});

		await this.invitesRepository.create(invite);

		await this.emailSender.sendInvite(invitedEmail, invite, organization);

		return right(null);
	}
}
