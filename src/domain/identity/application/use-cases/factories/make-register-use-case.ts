import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";
import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository";
import { RegisterUseCase } from "../register";

export function makeRegisterUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const hasher = new BcryptHasher();

	const registerUseCase = new RegisterUseCase(usersRepository, hasher);

	return registerUseCase;
}
