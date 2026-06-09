import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { type Either, left, right } from "@/core/types/either";
import { Member } from "../../enterprise/entities/member";
import { Organization } from "../../enterprise/entities/organization";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import type { MembersRepository } from "../repositories/members-repository";
import type { OrganizationsRepository } from "../repositories/organizations-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { OrganizationAlreadyExistsError } from "./errors/organization-already-exists-error";

interface CreateOrganizationUseCaseRequest {
	userId: string;
	name: string;
	avatarUrl: string | null;
}

type CreateOrganizationUseCaseResponse = Either<
	ResourceNotFoundError | OrganizationAlreadyExistsError,
	{ organization: Organization }
>;

export class CreateOrganizationUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private organizationsRepository: OrganizationsRepository,
		private membersRepository: MembersRepository,
	) {}

	async execute({
		userId,
		name,
		avatarUrl,
	}: CreateOrganizationUseCaseRequest): Promise<CreateOrganizationUseCaseResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return left(new ResourceNotFoundError());
		}

		const slug = Slug.createFromText(name);

		const organizationAlreadyExists =
			await this.organizationsRepository.findBySlug(slug.value);

		if (organizationAlreadyExists) {
			return left(new OrganizationAlreadyExistsError());
		}

		const organization = Organization.create({
			ownerId: user.id,
			name,
			slug,
			avatarUrl,
		});

		await this.organizationsRepository.create(organization);

		const membership = Member.create({
			userId: user.id,
			organizationId: organization.id,
			role: 'OWNER',
		});

		await this.membersRepository.create(membership);

		return right({
			organization,
		});
	}
}
