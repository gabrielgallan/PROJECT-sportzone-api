import { makeInvite } from 'test/unit/factories/make-invite';
import { makeOrganization } from 'test/unit/factories/make-organization';
import { makeUser } from 'test/unit/factories/make-user';
import { InMemoryInvitesRepository } from 'test/unit/repositories/in-memory-invites-repository';
import { InMemoryOrganizationsRepository } from 'test/unit/repositories/in-memory-organizations-reporitory';
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ListInvitesUseCase } from './list-invites';

let usersRepository: InMemoryUsersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;
let invitesRepository: InMemoryInvitesRepository;

let sut: ListInvitesUseCase;

describe('List invites use case', () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		invitesRepository = new InMemoryInvitesRepository(usersRepository, organizationsRepository);

		sut = new ListInvitesUseCase(usersRepository, invitesRepository);
	});

	it('should be able to list user invites by email', async () => {
		await usersRepository.create(
			await makeUser(
				{
					name: 'John Doe',
					email: 'johndoe@email.com',
				},
				new UniqueEntityID('user-1'),
			),
		);

		await usersRepository.create(
			await makeUser(
				{
					email: 'invited@email.com',
				},
				new UniqueEntityID('user-2'),
			),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					name: 'John Org',
					ownerId: new UniqueEntityID('user-1'),
				},
				new UniqueEntityID('org-1'),
			),
		);

		await invitesRepository.create(
			await makeInvite({
				authorId: new UniqueEntityID('user-1'),
				organizationId: new UniqueEntityID('org-1'),
				email: 'invited@email.com',
				role: 'BILLING',
			}),
		);

		const result = await sut.execute({
			userId: 'user-2',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.invites.data).toHaveLength(1);
			expect(result.value.invites.data[0]).toEqual(
				expect.objectContaining({
					organization: {
						name: 'John Org',
						authorName: 'John Doe',
					},
					role: 'BILLING',
					createdAt: expect.any(Date),
				}),
			);
		}
	});
});
