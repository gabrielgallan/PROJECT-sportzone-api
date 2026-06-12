import { Readable } from 'node:stream';
import { UploaderStub } from 'test/stubs/uploader';
import { makeOrganization } from 'test/unit/factories/make-organization';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/shared/value-objects/slug';
import { UploadOrganizationAvatarUseCase } from './upload-organization-avatar';

let uploader: UploaderStub;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: UploadOrganizationAvatarUseCase;

describe('upload organization avatar use case', () => {
	beforeEach(() => {
		organizationsRepository = new InMemoryOrganizationsRepository();
		uploader = new UploaderStub();

		sut = new UploadOrganizationAvatarUseCase(organizationsRepository, uploader);
	});

	it('should be able to upload an organization avatar', async () => {
		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					slug: new Slug('sportzone'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'sportzone',
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
