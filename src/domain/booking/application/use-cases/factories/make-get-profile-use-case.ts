import { PrismaUsersRepository } from "@/infra/repositories/prisma/prisma-users-repository.ts"
import { GetProfileUseCase } from "../get-profile.ts"

export function makeGetProfileUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const getProfileUseCase = new GetProfileUseCase(usersRepository)

    return getProfileUseCase
}