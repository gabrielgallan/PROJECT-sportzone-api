import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { EncrypterStub } from "test/stubs/encrypter";
import { HasherStup } from "test/stubs/hasher";
import { makeUser } from "test/unit/factories/make-user";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import type { Encrypter } from "../cryptography/encrypter";
import type { Hasher } from "../cryptography/hasher";
import { AuthenticateUseCase } from "./authenticate";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

let usersRepository: InMemoryUsersRepository;
let hasher: Hasher;
let encrypter: Encrypter;

let sut: AuthenticateUseCase;

describe("Authenticate member use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		hasher = new HasherStup();
		encrypter = new EncrypterStub();

		sut = new AuthenticateUseCase(usersRepository, hasher, encrypter);
	});

	it("should be able to authenticate user with credentials", async () => {
		await usersRepository.create(
			await makeUser(
				{
					email: "johndoe@email.com",
					passwordHash: await hasher.generate("johnDoe123"),
				},
				new UniqueEntityID("user-1"),
			),
		);

		const result = await sut.execute({
			email: "johndoe@email.com",
			password: "johnDoe123",
		});

		expect(result.isRight()).toBe(true);
		expect(result.value.token).toBe(JSON.stringify({ sub: "user-1" }));
	});

	it("should not be able to authenticate a user with incorrect credentials", async () => {
		await usersRepository.create(
			await makeUser({
				email: "johndoe@email.com",
				passwordHash: await hasher.generate("johnDoe123"),
			}),
		);

		const result = await sut.execute({
			email: "johndoe@email.com",
			password: "incorrectPassword",
		});

		expect(result.value).toBeInstanceOf(InvalidCredentialsError);
	});
});
