import { EmailSenderStub } from "test/stubs/email-sender";
import { makeOrganization } from "test/unit/factories/make-organization";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryInvitesRepository } from "test/unit/repositories/in-memory-invites-repository";
import { InMemoryOrganizationsRepository } from "test/unit/repositories/in-memory-organizations-reporitory";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { MemberRole } from "../../enterprise/entities/member";
import { InviteMemberUseCase } from "./invite-member";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { Slug } from "../../enterprise/entities/value-objects/slug";

let usersRepository: InMemoryUsersRepository;
let invitesRepository: InMemoryInvitesRepository;
let organizationsRepository: InMemoryOrganizationsRepository;
let emailSender: EmailSenderStub;

let sut: InviteMemberUseCase;

describe("Invite member use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		invitesRepository = new InMemoryInvitesRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		emailSender = new EmailSenderStub();

		sut = new InviteMemberUseCase(
			usersRepository,
			invitesRepository,
			organizationsRepository,
			emailSender,
		);
	});

	it("should be able to invite a member and send email", async () => {
		await usersRepository.create(
			await makeUser(
				{
					email: "owner@email.com",
				},
				new UniqueEntityID("user-1"),
			),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID("user-1"),
					slug: Slug.createFromText('org-1')
				},
				new UniqueEntityID('org-1')
			),
		);

		const result = await sut.execute({
			userId: "user-1",
			organizationSlug: "org-1",
			invitedEmail: "member@email.com",
			role: MemberRole.BILLING,
		});

		expect(result.isRight()).toBe(true);
		expect(invitesRepository.items).toHaveLength(1);
		expect(invitesRepository.items[0].authorId.toString()).toBe("user-1");
		expect(invitesRepository.items[0].organizationId.toString()).toBe("org-1");
		expect(invitesRepository.items[0].email).toBe("member@email.com");
		expect(invitesRepository.items[0].role).toBe(MemberRole.BILLING);
		expect(emailSender.emails[0].to).toBe("member@email.com");
		expect(emailSender.emails[0].subject).toBe("New Invite");
		expect(emailSender.emails[0].text).toContain("org-1");
	});

	it("should not be able to invite a member when user is not the organization owner", async () => {
		await usersRepository.create(
			await makeUser({}, new UniqueEntityID("user-1")),
		);

		await organizationsRepository.create(
			await makeOrganization(
				{
					ownerId: new UniqueEntityID("user-2"),
					slug: Slug.createFromText('org-1')
				},
			),
		);

		const result = await sut.execute({
			userId: "user-1",
			organizationSlug: "org-1",
			invitedEmail: "member@email.com",
			role: MemberRole.MEMBER,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InsufficientPermissionsError);
		expect(invitesRepository.items).toHaveLength(0);
		expect(emailSender.emails).toHaveLength(0);
	});
});
