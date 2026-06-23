import { repositories } from '@/infra/database';
import { services } from '@/infra/storage';
import { UploadAndCreateImage } from '../upload-and-create-image';

export function makeUploadImageUseCase() {
	const uploadImageUseCase = new UploadAndCreateImage(repositories.images, services.uploader);

	return uploadImageUseCase;
}
