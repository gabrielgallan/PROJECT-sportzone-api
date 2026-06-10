import { makeOrganization } from 'test/unit/factories/make-organization';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { CreateOrganizationUseCase } from './create-organization';
import { OrganizationAlreadyExistsError } from './errors/organization-already-exists-error';

let usersRepository: InMemoryUsersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;
let membersRepository: InMemoryMembersRepository;

let sut: CreateOrganizationUseCase;

describe('Create organization use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new CreateOrganizationUseCase(
			usersRepository,
			organizationsRepository,
			membersRepository,
		);
	});

	it('should be able to create an organization and owner membership', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		const result = await sut.execute({
			userId: 'user-1',
			name: 'SportZone FC',
			avatarUrl: null,
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.organization.name).toBe('SportZone FC');
			expect(result.value.organization.ownerId.toString()).toBe('user-1');
		}

		expect(organizationsRepository.items).toHaveLength(1);
		expect(membersRepository.items).toHaveLength(1);
		expect(membersRepository.items[0].userId.toString()).toBe('user-1');
		expect(membersRepository.items[0].role).toBe('OWNER');
		expect(membersRepository.items[0].organizationId.toString()).toBe(
			organizationsRepository.items[0].id.toString(),
		);
	});

	it('should not be able to create an organization for a non-existing user', async () => {
		const result = await sut.execute({
			userId: 'non-existing-user-id',
			name: 'SportZone FC',
			avatarUrl: null,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});

	it('should not be able to create an organization with a slug that already used', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await organizationsRepository.create(
			await makeOrganization({
				name: 'Sportzone Org',
				slug: Slug.createFromText('sportzone-org'),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			name: 'Sportzone Org',
			avatarUrl: null,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(OrganizationAlreadyExistsError);
	});
});
