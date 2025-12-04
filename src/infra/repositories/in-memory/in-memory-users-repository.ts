import { UserRole, type Prisma, type User } from "@prisma/client";
import type { UsersRepository } from "@/domain/repositories/users-repository.ts";
import { randomUUID } from "crypto";


export class InMemoryUsersRepository implements UsersRepository {
    private items: User[] = []

    async findByUserId(id: string) {
        const user = this.items.find(user => user.id === id)

        if (!user) return null

        return user
    }

    async create(data: Prisma.UserCreateInput) {
        const { name, email, password_hash } = data

        const user = {
            id: data.id ?? randomUUID(),
            name,
            email,
            role: UserRole.MEMBER,
            password_hash,
            created_at: new Date()
        }

        this.items.push(user)

        return user
    }

    async findByEmail(email: string) {
        const user = this.items.find(user => user.email === email)

        if (!user) return null

        return user
    }
}