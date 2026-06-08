import { makeMember } from "test/unit/factories/make-member";
import { makeOrganization } from "test/unit/factories/make-organization";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryMembersRepository } from "test/unit/repositories/in-memory-members-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { MemberRole } from "../../enterprise/entities/member";
import { ListUserOrganizationsUseCase } from "./list-user-organizations";

let usersRepository: InMemoryUsersRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: ListUserOrganizationsUseCase;

describe("List user organizations use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new ListUserOrganizationsUseCase(
			usersRepository,
			membersRepository,
		);
	});

	it("should be able to list user organizations with role", async () => {
		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-1")),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					name: "SportZone FC",
				},
				new UniqueEntityID("org-1"),
			),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					name: "Arena Club",
				},
				new UniqueEntityID("org-2"),
			),
		);

		await membersRepository.create(
			await makeMember({
				userId: new UniqueEntityID("user-1"),
				organizationId: new UniqueEntityID("org-1"),
				role: MemberRole.OWNER,
			}),
		);

		await membersRepository.create(
			await makeMember({
				userId: new UniqueEntityID("user-1"),
				organizationId: new UniqueEntityID("org-2"),
				role: MemberRole.BILLING,
			}),
		);

		const result = await sut.execute({
			userId: "user-1",
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.organizations.data).toHaveLength(2);
			expect(result.value.organizations.data[0].organization.name).toBe(
				"SportZone FC",
			);
			expect(result.value.organizations.data[0].role).toBe(MemberRole.OWNER);
			expect(result.value.organizations.data[1].organization.name).toBe(
				"Arena Club",
			);
			expect(result.value.organizations.data[1].role).toBe(MemberRole.BILLING);
		}
	});
});
