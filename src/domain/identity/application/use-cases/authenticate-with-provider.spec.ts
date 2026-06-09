import { AuthProviderStub } from "test/stubs/auth-provider";
import { EncrypterStub } from "test/stubs/encrypter";
import { InMemoryAccountsRepository } from "test/unit/repositories/in-memory-accounts-repository";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import type { AuthProvider } from "../auth/auth-provider";
import type { Encrypter } from "../cryptography/encrypter";
import { AuthenticateWithProviderUseCase } from "./authenticate-with-provider";

let usersRepository: InMemoryUsersRepository;
let accountsRepository: InMemoryAccountsRepository;
let authProvider: AuthProvider;
let encrypter: Encrypter;

let sut: AuthenticateWithProviderUseCase;

describe("Authenticate with  provider use case", () => {
	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		accountsRepository = new InMemoryAccountsRepository();
		authProvider = new AuthProviderStub();
		encrypter = new EncrypterStub();

		sut = new AuthenticateWithProviderUseCase(
			usersRepository,
			accountsRepository,
			authProvider,
			encrypter,
		);
	});

	it("should be able to authenticate with  provider", async () => {
		await sut.execute({
			provider: "GITHUB",
			code: "fake-provider-code",
		});

		expect(accountsRepository.items[0].providerUserId).toBe("-user-id");

		expect(usersRepository.items[0].email).toBe("johndoe@example.com");
		expect(usersRepository.items[0].name).toBe("John Doe");
		expect(usersRepository.items[0].avatarUrl).toBe(
			"https://example.com/avatar.jpg",
		);
	});
});
