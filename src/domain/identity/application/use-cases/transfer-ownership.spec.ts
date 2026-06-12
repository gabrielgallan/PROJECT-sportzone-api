import { makeMember } from 'test/unit/factories/make-member';
import { makeOrganization } from 'test/unit/factories/make-organization';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/shared/value-objects/slug';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { TransferOwnershipUseCase } from './transfer-ownership';

let usersRepository: InMemoryUsersRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: TransferOwnershipUseCase;

describe('Transfer ownership use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new TransferOwnershipUseCase(usersRepository, membersRepository, organizationsRepository);
	});

	it('should be able to transfer organization ownership', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-2')));

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
					userId: new UniqueEntityID('user-1'),
					organizationId: new UniqueEntityID('org-1'),
					role: 'OWNER',
				},
				new UniqueEntityID('member-1'),
			),
		);

		await membersRepository.create(
			await makeMember(
				{
					userId: new UniqueEntityID('user-2'),
					organizationId: new UniqueEntityID('org-1'),
					role: 'MEMBER',
				},
				new UniqueEntityID('member-2'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			memberId: 'member-2',
		});

		expect(result.isRight()).toBe(true);
		expect(organizationsRepository.items[0].ownerId.toString()).toBe('user-2');
		expect(membersRepository.items[0].role).toBe('MEMBER');
		expect(membersRepository.items[1].role).toBe('OWNER');
	});

	it('should not be able to transfer ownership when user is not the organization owner', async () => {
		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-1')));

		await usersRepository.create(await makeUser({}, new UniqueEntityID('user-2')));

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID('user-3'),
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
				new UniqueEntityID('member-2'),
			),
		);

		const result = await sut.execute({
			userId: 'user-1',
			organizationSlug: 'org-1',
			memberId: 'member-2',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
	});
});
