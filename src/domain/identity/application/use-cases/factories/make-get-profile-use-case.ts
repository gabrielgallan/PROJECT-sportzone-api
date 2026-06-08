import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository";
import { GetProfileUseCase } from "../get-profile";

export function makeGetProfileUseCase() {
	const usersRepository = new PrismaUsersRepository();

	const getProfileUseCase = new GetProfileUseCase(usersRepository);

	return getProfileUseCase;
}
