import { makeMember } from 'test/unit/factories/make-member';
import { makeOrganization } from 'test/unit/factories/make-organization';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { InvalidMembershipRoleError } from './errors/invalid-membership-role-error';
import { UpdateMembershipRoleUseCase } from './update-membership-role';

let usersRepository: InMemoryUsersRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: UpdateMembershipRoleUseCase;

describe('Update membership role use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new UpdateMembershipRoleUseCase(
			usersRepository,
			membersRepository,
			organizationsRepository,
		);
	});

	it('should be able to update a membership role', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

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
			await makeMember(
				{
					userId: new UniqueEntityID('user-2'),
					organizationId: new UniqueEntityID('org-1'),
					role: 'MEMBER',
				},
				new UniqueEntityID('member-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			memberId: 'member-1',
			role: 'BILLING',
		});

		expect(result.isRight()).toBe(true);
		expect(membersRepository.items[0].role).toBe('BILLING');
	});

	it('should not be able to update a membership role when user is not the organization owner', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-2'),
					slug: Slug.createFromText('org-1'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		await membersRepository.create(
			await makeMember(
				{
					userId: new UniqueEntityID('user-3'),
					organizationId: new UniqueEntityID('org-1'),
					role: 'MEMBER',
				},
				new UniqueEntityID('member-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			memberId: 'member-1',
			role: 'BILLING',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
		expect(membersRepository.items[0].role).toBe('MEMBER');
	});

	it('should not be able to update a membership role to owner', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await organizationsRepository.create(
			await makeOrganization({
				ownerId: new UniqueEntityID('user-1'),
				slug: Slug.createFromText('org-1'),
			}),
		);

		await membersRepository.create(
			await makeMember(
				{
					userId: new UniqueEntityID('user-2'),
					organizationId: new UniqueEntityID('org-1'),
					role: 'MEMBER',
				},
				new UniqueEntityID('member-1'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			memberId: 'member-1',
			role: 'OWNER',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidMembershipRoleError);
		expect(membersRepository.items[0].role).toBe('MEMBER');
	});
});
