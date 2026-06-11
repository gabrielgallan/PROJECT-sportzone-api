import { Readable } from 'node:stream';
import { UploaderStub } from 'test/stubs/uploader';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UploadAvatarUseCase } from './upload-avatar';

let usersRepository: InMemoryUsersRepository;
let uploader: UploaderStub;

let sut: UploadAvatarUseCase;

describe('upload user avatar use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		uploader = new UploaderStub();

		sut = new UploadAvatarUseCase(usersRepository, uploader);
	});

	it('should be able to upload an user avatar', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		const result = await sut.execute({
			userId: 'user-1',
			fileName: 'avatar.png',
			fileType: 'image/png',
			body: Readable.from(Buffer.from('')),
		});

		expect(result.isRight()).toBe(true);
		expect(uploader.uploads).toHaveLength(1);
		expect(uploader.uploads[0]).toMatchObject({
			fileName: 'avatar.png',
			url: expect.any(String),
		});
	});
});
