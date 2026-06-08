import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";
import { FastifyJwtEncrypter } from "@/infra/cryptography/jwt-encrypter";
import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository";
import { app } from "@/infra/http/app";
import { AuthenticateUseCase } from "../authenticate";

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
