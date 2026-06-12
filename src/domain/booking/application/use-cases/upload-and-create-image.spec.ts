import { Readable } from 'node:stream';
import { InvalidImageTypeError } from './errors/invalid-image-type-error';
import { UploadAndCreateImage } from './upload-and-create-image';
import { UploaderStub } from 'test/stubs/uploader';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';

let imagesRepository: InMemoryImagesRepository;
let uploader: UploaderStub;

let sut: UploadAndCreateImage;

describe('Upload and create image use case', () => {
	beforeEach(() => {
		imagesRepository = new InMemoryImagesRepository();
		uploader = new UploaderStub();

		sut = new UploadAndCreateImage(imagesRepository, uploader);
	});

	it('should be able to upload and create an image', async () => {
		const result = await sut.execute({
			fileName: 'court.png',
			fileType: 'image/png',
			body: Readable.from(Buffer.from('')),
		});

		expect(result.isRight()).toBe(true);
		expect(imagesRepository.items).toHaveLength(1);
		expect(imagesRepository.items[0].title).toBe('court.png');
		expect(imagesRepository.items[0].url).toEqual(expect.any(String));
		expect(uploader.uploads).toHaveLength(1);
		expect(uploader.uploads[0].fileName).toBe('court.png');
	});

	it('should not be able to upload a file with an invalid image type', async () => {
		const result = await sut.execute({
			fileName: 'court.pdf',
			fileType: 'application/pdf',
			body: Readable.from(Buffer.from('')),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidImageTypeError);
		expect(imagesRepository.items).toHaveLength(0);
		expect(uploader.uploads).toHaveLength(0);
	});
});
