import { it, describe, expect, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { RegisterUseCase } from './register.ts'
import { compare } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists.ts'
import type { UsersRepository } from '@/domain/repositories/users-repository.ts'

let usersRepository: UsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new RegisterUseCase(usersRepository)
    })

    it('should be able to register', async () => {
        const { user } = await sut.execute({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password: '123456'
        })

        expect(user.email).toBe('gabriel@email.com')
    })

    it('should hash user password during registration', async () => {
        const { user } = await sut.execute({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password: '123456'
        })

        const isPasswordCorrectHashed = await compare('123456', user.password_hash)

        expect(isPasswordCorrectHashed).toBe(true)
    })

    it("shouldn't be possible to register with an existing e-mail", async () => {
        const { user } = await sut.execute({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password: '123456'
        })

        await expect(() =>
            sut.execute({
                name: 'Gabriel',
                email: 'gabriel@email.com',
                password: '123456'
            })
        ).rejects.toBeInstanceOf(UserAlreadyExistsError)
    })
})