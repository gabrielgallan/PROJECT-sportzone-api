import { makeInvite } from "test/unit/factories/make-invite";
import { makeOrganization } from "test/unit/factories/make-organization";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryInvitesRepository } from "test/unit/repositories/in-memory-invites-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InviteStatus } from "../../enterprise/entities/invite";
import { DeclineInviteUseCase } from "./decline-invite";
import { InviteAccessDeniedError } from "./errors/invite-access-denied-error";

let usersRepository: InMemoryUsersRepository;
let invitesRepository: InMemoryInvitesRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: DeclineInviteUseCase;

describe("Decline invite use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		invitesRepository = new InMemoryInvitesRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();

		sut = new DeclineInviteUseCase(
			usersRepository,
			invitesRepository,
			organizationsRepository,
		);
	});

	it("should be able to decline an invite", async () => {
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
			expect(invitesRepository.items[0].status).toBe(InviteStatus.DECLINED);
		}
	});

	it("should return an access denied error when invite email does not match user email", async () => {
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
