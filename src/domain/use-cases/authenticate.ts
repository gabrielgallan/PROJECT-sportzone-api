import type { User } from "@prisma/client";
import type { UsersRepository } from "../repositories/users-repository.ts"
import { compare } from "bcryptjs";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";

interface AuthenticateUseCaseRequest {
    email: string
    password: string
}

interface AuthenticateUseCaseResponse {
    user: User
}

export class AuthenticateUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
        const userWithInformedEmail = await this.usersRepository.findByEmail(email)

        if (!userWithInformedEmail) {
            throw new InvalidCredentialsError()
        }

        const isPasswordCorrect = await compare(password, userWithInformedEmail.password_hash)

        if (!isPasswordCorrect) {
            throw new InvalidCredentialsError()
        }

        return { user: userWithInformedEmail }
    }
}