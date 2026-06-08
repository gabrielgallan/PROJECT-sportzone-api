import { makeInvite } from "test/unit/factories/make-invite";
import { makeOrganization } from "test/unit/factories/make-organization";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryInvitesRepository } from "test/unit/repositories/in-memory-invites-repository";
import { InMemoryMembersRepository } from "test/unit/repositories/in-memory-members-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InviteStatus } from "../../enterprise/entities/invite";
import { AcceptInviteUseCase } from "./accept-invite";
import { InviteAccessDeniedError } from "./errors/invite-access-denied-error";

let usersRepository: InMemoryUsersRepository;
let invitesRepository: InMemoryInvitesRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: AcceptInviteUseCase;

describe("Accept invite use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		invitesRepository = new InMemoryInvitesRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new AcceptInviteUseCase(
			usersRepository,
			invitesRepository,
			membersRepository,
			organizationsRepository,
		);
	});

	it("should be able to accept an invite", async () => {
		await usersRepository.create(
			await makeUser(
				{
					email: "johndoe@email.com",
				},
				new UniqueEntityID("user-1"),
			),
		);

		await invitesRepository.create(
			await makeInvite(
				{
					email: "johndoe@email.com",
					organizationId: new UniqueEntityID("org-1"),
				},
				new UniqueEntityID("invite-1"),
			),
		);

		await organizationsRepository.create(
			await makeOrganization({}, new UniqueEntityID("org-1")),
		);

		const result = await sut.execute({
			userId: "user-1",
			inviteId: "invite-1",
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(invitesRepository.items[0].status).toBe(InviteStatus.ACCEPTED);
		}
	});

	it("should be able to accept an invite", async () => {
		await usersRepository.create(
			await makeUser(
				{
					email: "johndoe@email.com",
				},
				new UniqueEntityID("user-1"),
			),
		);

		await invitesRepository.create(
			await makeInvite(
				{
					email: "another-email@email.com",
					organizationId: new UniqueEntityID("org-1"),
				},
				new UniqueEntityID("invite-1"),
			),
		);

		await organizationsRepository.create(
			await makeOrganization({}, new UniqueEntityID("org-1")),
		);

		const result = await sut.execute({
			userId: "user-1",
			inviteId: "invite-1",
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteAccessDeniedError);
	});
});
