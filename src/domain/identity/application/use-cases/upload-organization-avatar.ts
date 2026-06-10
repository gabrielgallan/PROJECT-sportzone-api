import type { Readable } from 'node:stream';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { OrganizationsRepository } from '../repositories/organizations-repository';
import type { Uploader } from '../storage/uploader';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';

interface UploadOrganizationAvatarUseCaseRequest {
	userId: string;
	organizationSlug: string;
	fileName: string;
	fileType: string;
	body: Readable;
}

type UploadOrganizationAvatarUseCaseResponse = Either<
	ResourceNotFoundError | InsufficientPermissionsError,
	null
>;

export class UploadOrganizationAvatarUseCase {
	constructor(
		private organizationsRepository: OrganizationsRepository,
		private uploader: Uploader,
	) {}

	async execute({
		userId,
		organizationSlug,
		fileName,
		fileType,
		body,
	}: UploadOrganizationAvatarUseCaseRequest): Promise<UploadOrganizationAvatarUseCaseResponse> {
		const organization = await this.organizationsRepository.findBySlug(organizationSlug);

		if (!organization) {
			return left(new ResourceNotFoundError());
		}

		if (organization.ownerId.toString() !== userId) {
			return left(new InsufficientPermissionsError());
		}

		const { url } = await this.uploader.uploadAvatar({
			fileName,
			fileType,
			body,
		});

		organization.avatarUrl = url;

		await this.organizationsRepository.save(organization);

		return right(null);
	}
}
