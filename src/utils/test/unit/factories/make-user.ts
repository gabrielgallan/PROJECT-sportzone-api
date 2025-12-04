import { hash } from "bcryptjs";
import type { UsersRepository } from "@/domain/repositories/users-repository.ts";


export async function makeUser (
    repository: UsersRepository
) {
    const user = repository.create({
        name: 'Gabriel',
        email: 'gabriel@example.com',
        password_hash: await hash('123456', 6)
    })

    return user
}