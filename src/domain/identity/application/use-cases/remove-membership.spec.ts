import { makeMember } from "test/unit/factories/make-member";
import { makeOrganization } from "test/unit/factories/make-organization";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryMembersRepository } from "test/unit/repositories/in-memory-members-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { RemoveMembershipUseCase } from "./remove-membership";
import { Slug } from "../../enterprise/entities/value-objects/slug";

let usersRepository: InMemoryUsersRepository;
let membersRepository: InMemoryMembersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;

let sut: RemoveMembershipUseCase;

describe("Remove membership use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository(usersRepository, organizationsRepository);

		sut = new RemoveMembershipUseCase(
			usersRepository,
			membersRepository,
			organizationsRepository,
		);
	});

	it("should be able to remove a membership from your organization", async () => {
		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-1")),
		);

		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-2")),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID("user-1"),
					slug: Slug.createFromText('org-1')
				},
			),
		);

		await membersRepository.create(
			await makeMember(
				{
					userId: new UniqueEntityID("user-2"),
					organizationId: new UniqueEntityID("org-1"),
					role: 'MEMBER',
				},
				new UniqueEntityID("member-1"),
			),
		);

		const result = await sut.execute({
			userId: "user-1",
			organizationSlug: "org-1",
			memberId: "member-1",
		});

		expect(result.isRight()).toBe(true);
		expect(membersRepository.items).toHaveLength(1);
	});

	it("should not be able to remove a membership when user is not the organization owner", async () => {
		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-1")),
		);

		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-2")),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID("user-1"),
					slug: Slug.createFromText('org-1')
				},
			),
		);

		await membersRepository.create(
			await makeMember(
				{
					userId: new UniqueEntityID("user-2"),
					organizationId: new UniqueEntityID("org-1"),
					role: 'MEMBER',
				},
				new UniqueEntityID("member-1"),
			),
		);

		const result = await sut.execute({
			userId: "user-2",
			organizationSlug: "org-1",
			memberId: "member-1",
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
	});
});
