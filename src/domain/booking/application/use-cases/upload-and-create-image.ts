import { Readable } from 'node:stream';
import { InvalidImageTypeError } from './errors/invalid-image-type-error';
import { Image } from '../../enterprise/entities/image';
import { ImagesRepository } from '../repositories/images-repository';
import { Either, left, right } from '@/core/types/either';
import { Uploader } from '../storage/uploader';

type UploadAndCreateImageRequest = {
    fileName: string;
    fileType: string;
    body: Readable;
};

type UploadAndCreateImageResponse = Either<InvalidImageTypeError, { image: Image }>;

export class UploadAndCreateImage {
    constructor(private imagesRepository: ImagesRepository, private uploader: Uploader) {}

    async execute({
        fileName,
        fileType,
        body
    }: UploadAndCreateImageRequest): Promise<UploadAndCreateImageResponse> {
        if (!(/^image\/(jpeg|png|webp|heic)$/).test(fileType)) {
            return left(new InvalidImageTypeError())
        }

        const { url } = await this.uploader.upload({ fileName, fileType, body })

        const image = Image.create({
            title: fileName,
            url
        })

        await this.imagesRepository.create(image)

        return right({
            image
        })
    }
}
