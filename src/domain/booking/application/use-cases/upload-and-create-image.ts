import type { Readable } from 'node:stream';
import { type Either, left, right } from '@/core/types/either';
import { Image } from '../../enterprise/entities/image';
import type { ImagesRepository } from '../repositories/images-repository';
import type { Uploader } from '../storage/uploader';
import { InvalidImageTypeError } from './errors/invalid-image-type-error';

type UploadAndCreateImageRequest = {
	fileName: string;
	fileType: string;
	body: Readable;
};

type UploadAndCreateImageResponse = Either<InvalidImageTypeError, { image: Image }>;

export class UploadAndCreateImage {
	constructor(
		private imagesRepository: ImagesRepository,
		private uploader: Uploader,
	) {}

	async execute({
		fileName,
		fileType,
		body,
	}: UploadAndCreateImageRequest): Promise<UploadAndCreateImageResponse> {
		if (!/^image\/(jpeg|png|webp|heic)$/.test(fileType)) {
			return left(new InvalidImageTypeError());
		}

		const { url } = await this.uploader.upload({ fileName, fileType, body });

		const image = Image.create({
			title: fileName,
			url,
		});

		await this.imagesRepository.create(image);

		return right({
			image,
		});
	}
}
