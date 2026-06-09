import { makeOrganization } from 'test/unit/factories/make-organization';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { OrganizationAlreadyExistsError } from './errors/organization-already-exists-error';
import { UpdateOrganizationProfileUseCase } from './update-organization-profile';

let organizationsRepository: InMemoryOrganizationsRepository;

let sut: UpdateOrganizationProfileUseCase;

describe('Update organization profile use case', () => {
	beforeEach(() => {
		organizationsRepository = new InMemoryOrganizationsRepository();

		sut = new UpdateOrganizationProfileUseCase(organizationsRepository);
	});

	it('should be able to update a organization profile', async () => {
		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					slug: Slug.createFromText('org-1'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			name: 'New name',
		});

		expect(result.isRight()).toBe(true);
		expect(organizationsRepository.items[0].name).toBe('New name');
		expect(organizationsRepository.items[0].slug.value).toBe('new-name');
	});

	it('should not be able to update a membership role when user is not the organization owner', async () => {
		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					slug: Slug.createFromText('org-1'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-2',
			organizationSlug: 'org-1',
			name: 'new name',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
	});

	it('should not be able to change the organization name to another already used', async () => {
		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					name: 'Sportzone Club',
					slug: Slug.createFromText('sportzone-club'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					name: 'Arena Club',
					slug: Slug.createFromText('arena-club'),
				},
				new UniqueEntityID('org-2'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'arena-club',
			name: 'Sportzone Club',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(OrganizationAlreadyExistsError);
	});
});
