import { RegisterUseCase } from "@/domain/identity/application/use-cases/register";
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";
import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository.ts";

export function makeRegisterUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const hasher = new BcryptHasher();

	const registerUseCase = new RegisterUseCase(usersRepository, hasher);

	return registerUseCase;
}
