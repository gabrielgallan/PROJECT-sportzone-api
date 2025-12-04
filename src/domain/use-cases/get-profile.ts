import type { User } from "@prisma/client";
import type { UsersRepository } from "../repositories/users-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts";

interface GetProfileUseCaseRequest {
    userId: string
}

interface GetProfileUseCaseResponse {
    user: User
}

export class GetProfileUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({ userId }: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
        const user = await this.usersRepository.findByUserId(userId)

        if (!user) {
            throw new ResourceNotFound()
        }

        return {
            user,
        }
    }
}