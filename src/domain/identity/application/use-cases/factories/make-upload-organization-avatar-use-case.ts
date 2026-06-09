import { repositories } from '@/infra/database';
import { services as storage } from '@/infra/storage';
import { UploadOrganizationAvatarUseCase } from '../upload-organization-avatar';

export function makeUploadOrganizationAvatarUseCase() {
	const uploadOrgAvatarUseCase = new UploadOrganizationAvatarUseCase(
		repositories.organizations,
		storage.uploader,
	);

	return uploadOrgAvatarUseCase;
}
