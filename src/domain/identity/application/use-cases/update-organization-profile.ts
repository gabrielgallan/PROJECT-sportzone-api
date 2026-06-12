import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Slug } from '@/core/shared/value-objects/slug';
import { type Either, left, right } from '@/core/types/either';
import type { OrganizationsRepository } from '../repositories/organizations-repository';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { OrganizationAlreadyExistsError } from './errors/organization-already-exists-error';

interface UpdateOrganizationProfileUseCaseRequest {
	userId: string;
	organizationSlug: string;
	name?: string;
}

type UpdateOrganizationProfileUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError | OrganizationAlreadyExistsError,
	null
>;

export class UpdateOrganizationProfileUseCase {
	constructor(private organizationsRepository: OrganizationsRepository) {}

	async execute({
		userId,
		organizationSlug,
		name,
	}: UpdateOrganizationProfileUseCaseRequest): Promise<UpdateOrganizationProfileUseCaseResponse> {
		const organization = await this.organizationsRepository.findBySlug(organizationSlug);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (organization.ownerId.toString() !== userId) {
			return left(new InsufficientPermissionsError());
		}

		if (name) {
			const nameAlreadyUsed = await this.organizationsRepository.findBySlug(
				Slug.createFromText(name).value,
			);

			if (nameAlreadyUsed) {
				return left(new OrganizationAlreadyExistsError());
			}

			organization.name = name;
		}

		await this.organizationsRepository.save(organization);

		return right(null);
	}
}
