import { it, describe, expect, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { GetProfileUseCase } from './get-profile.ts'
import { ResourceNotFound } from './errors/resource-not-found.ts'
import type { UsersRepository } from '@/domain/repositories/users-repository.ts'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'

let usersRepository: UsersRepository
let sut: GetProfileUseCase

describe("Get User Profile Use Case", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new GetProfileUseCase(usersRepository)
    })

    it("should be able to get user profile", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            userId: userCreated.id
        })

        expect(user.email).toBe(userCreated.email)
    })

    it("should not be able to get a profile of a user doesn't exists", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() => 
            sut.execute({
                userId: randomUUID()
            })
        ).rejects.toBeInstanceOf(ResourceNotFound)
    })
})