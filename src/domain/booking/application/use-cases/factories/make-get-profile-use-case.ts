import { GetProfileUseCase } from "@/domain/identity/application/use-cases/get-profile";
import { PrismaUsersRepository } from "@/infra/database/prisma/repositories/prisma-users-repository";

export function makeGetProfileUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const getProfileUseCase = new GetProfileUseCase(usersRepository);

	return getProfileUseCase;
}
