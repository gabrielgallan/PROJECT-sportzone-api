import { it, describe, expect, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import type { UsersRepository } from '@/domain/repositories/users-repository.ts'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { AuthenticateUseCase } from './authenticate.ts'
import { InvalidCredentialsError } from './errors/invalid-credentials-error.ts'

let usersRepository: UsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new AuthenticateUseCase(usersRepository)
    })

    it('should be able to authenticate', async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            email: 'gabriel@email.com',
            password: '123456'
        })

        expect(user).toEqual(expect.objectContaining({
            name: 'Gabriel',
            email: 'gabriel@email.com',
        }))
    })

    it("should not be able to authenticate with an e-mail doesn't exists", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() => 
            sut.execute({
                email: 'gab@email.com',
                password: '123456'
            })
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })

    it("should not be able to authenticate with wrong password", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() => 
            sut.execute({
                email: 'gabriel@email.com',
                password: '654321'
            })
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })
})