import { makeInvite } from "test/unit/factories/make-invite";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryInvitesRepository } from "test/unit/repositories/in-memory-invites-repository";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ListInvitesUseCase } from "./list-invites";

let usersRepository: InMemoryUsersRepository;
let invitesRepository: InMemoryInvitesRepository;

let sut: ListInvitesUseCase;

describe("List invites use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		invitesRepository = new InMemoryInvitesRepository();

		sut = new ListInvitesUseCase(usersRepository, invitesRepository);
	});

	it("should be able to list user invites by email", async () => {
		await usersRepository.create(
			await makeUser(
				{
					email: "johndoe@email.com",
				},
				new UniqueEntityID("user-1"),
			),
		);

		await invitesRepository.create(
			await makeInvite({
				email: "johndoe@email.com",
			}),
		);

		const result = await sut.execute({
			userId: "user-1",
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.invites).toHaveLength(1);
		}
	});
});
