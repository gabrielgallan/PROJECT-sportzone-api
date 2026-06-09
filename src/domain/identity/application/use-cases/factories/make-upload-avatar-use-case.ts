import { repositories } from '@/infra/database';
import { services as storage } from '@/infra/storage';
import { UploadAvatarUseCase } from '../upload-avatar';

export function makeUploadAvatarUseCase() {
	const uploadAvatarUseCase = new UploadAvatarUseCase(repositories.users, storage.uploader);

	return uploadAvatarUseCase;
}
