import { makeUser } from "test/unit/factories/make-user";
import { InMemoryMembersRepository } from "test/unit/repositories/in-memory-members-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { MemberRole } from "../../enterprise/entities/member";
import { CreateOrganizationUseCase } from "./create-organization";

let usersRepository: InMemoryUsersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;
let membersRepository: InMemoryMembersRepository;

let sut: CreateOrganizationUseCase;

describe("Create organization use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository);

		sut = new CreateOrganizationUseCase(
			usersRepository,
			organizationsRepository,
			membersRepository,
		);
	});

	it("should be able to create an organization and owner membership", async () => {
		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-1")),
		);

		const result = await sut.execute({
			userId: "user-1",
			name: "SportZone FC",
			avatarUrl: null,
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.organization.name).toBe("SportZone FC");
			expect(result.value.organization.ownerId.toString()).toBe("user-1");
		}

		expect(organizationsRepository.items).toHaveLength(1);
		expect(membersRepository.items).toHaveLength(1);
		expect(membersRepository.items[0].userId.toString()).toBe("user-1");
		expect(membersRepository.items[0].role).toBe(MemberRole.OWNER);
		expect(membersRepository.items[0].organizationId.toString()).toBe(
			organizationsRepository.items[0].id.toString(),
		);
	});

	it("should not be able to create an organization for a non-existing user", async () => {
		const result = await sut.execute({
			userId: "non-existing-user-id",
			name: "SportZone FC",
			avatarUrl: null,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
