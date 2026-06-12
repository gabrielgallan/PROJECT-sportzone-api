import { makeMember } from 'test/unit/factories/make-member';
import { makeOrganization } from 'test/unit/factories/make-organization';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/shared/value-objects/slug';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { ListOrganizationMembersUseCase } from './list-organization-members';

let usersRepository: InMemoryUsersRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: ListOrganizationMembersUseCase;

describe('List organization members use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new ListOrganizationMembersUseCase(
			usersRepository,
			membersRepository,
			organizationsRepository,
		);
	});

	it('should be able to list organization members with profile', async () => {
		await usersRepository.create(
			await makeUser(
				{
					name: 'Owner User',
					email: 'owner@email.com',
				},
				new UniqueEntityID('user-1'),
			),
		);

		await usersRepository.create(
			await makeUser(
				{
					name: 'John Doe',
					email: 'john@email.com',
				},
				new UniqueEntityID('user-2'),
			),
		);

		await usersRepository.create(
			await makeUser(
				{
					name: 'Jane Doe',
					email: 'jane@email.com',
				},
				new UniqueEntityID('user-3'),
			),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-1'),
					slug: Slug.createFromText('org-1'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		await membersRepository.create(
			await makeMember({
				userId: new UniqueEntityID('user-2'),
				organizationId: new UniqueEntityID('org-1'),
				role: 'MEMBER',
				createdAt: new Date(2024, 0, 1),
			}),
		);

		await membersRepository.create(
			await makeMember({
				userId: new UniqueEntityID('user-3'),
				organizationId: new UniqueEntityID('org-1'),
				role: 'BILLING',
				createdAt: new Date(2024, 0, 2),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			pagination: {
				page: 1,
				limit: 20,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.members.data).toHaveLength(2);
			expect(result.value.members.data[0].user.email).toBe('jane@email.com');
			expect(result.value.members.data[1].user.name).toBe('John Doe');
		}
	});

	it('should not be able to list organization members when user is not the owner', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await organizationsRepository.create(
			await makeOrganization({
				ownerId: new UniqueEntityID('user-2'),
				slug: Slug.createFromText('org-1'),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			pagination: {
				page: 1,
				limit: 20,
			},
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
	});
});
