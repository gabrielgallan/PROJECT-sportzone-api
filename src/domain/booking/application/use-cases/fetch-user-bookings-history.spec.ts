import { it, describe, expect, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'
import { FetchUserBookingsHistoryUseCase } from './fetch-user-bookings-history.ts'
import { ResourceNotFound } from './errors/resource-not-found.ts'
import type { UsersRepository } from '@/domain/repositories/users-repository.ts'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import type { BookingsRepository } from '../../../repositories/bookings-repository.ts'

let usersRepository: UsersRepository
let bookingsRepository: BookingsRepository
let sut: FetchUserBookingsHistoryUseCase

describe("Fetch user bookings history use case", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        bookingsRepository = new InMemoryBookingsRepository()
        sut = new FetchUserBookingsHistoryUseCase(bookingsRepository, usersRepository)
    })

    it("should be able to fetch user booking history", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        for (let c = 0; c < 25; c++) {
            const newBooking = await bookingsRepository.create({
                user_id: userCreated.id,
                sportCourt_id: `court-${c}`,
                start_time: new Date(2025, 0, 13, 10, 0, 0),
                end_time: new Date(2025, 0, 13, 14, 0, 0),
                price: 60
            })
        }

        const bookingsPage01 = await sut.execute({
            userId: userCreated.id,
            page: 1
        })

        const bookingsPage02 = await sut.execute({
            userId: userCreated.id,
            page: 2
        })

        expect(bookingsPage01.bookings).toHaveLength(20)
        expect(bookingsPage02.bookings).toHaveLength(5)
    })

    it("should not be able to fetch bookings history of a user doesn't exists", async () => {
        const userCreated = await usersRepository.create({
            name: 'Gabriel',
            email: 'gabriel@email.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                page: 1
            })
        ).rejects.toBeInstanceOf(ResourceNotFound)
    })
})