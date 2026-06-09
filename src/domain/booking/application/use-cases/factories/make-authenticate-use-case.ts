import { AuthenticateUseCase } from "@/domain/identity/application/use-cases/authenticate";
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";
import { FastifyJwtEncrypter } from "@/infra/cryptography/jwt-encrypter";
import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository.ts";
import { app } from "@/infra/http/app";

export function makeAuthenticateUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const hasher = new BcryptHasher();
	const encrypter = new FastifyJwtEncrypter(app);
	const authenticateUseCase = new AuthenticateUseCase(
		usersRepository,
		hasher,
		encrypter,
	);

	return authenticateUseCase;
}
