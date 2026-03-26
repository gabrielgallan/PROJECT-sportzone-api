import { it, describe, expect, beforeEach, afterEach, vi } from 'vitest'
import { RestrictCourtDateUseCase } from './restrict-court-dates.ts'
import { UnauthorizedToModifySportCourts } from './errors/unauthorized-to-modify-court.ts'
import type { UsersRepository } from '../../../repositories/users-repository.ts'
import type { CourtBlockedDatesRepository } from '../../../repositories/court-blocked-dates-repository.ts'
import type { SportCourtsRepository } from '../../../repositories/sport-courts-repository.ts'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryCourtBlockedDatesRepository } from '@/infra/repositories/in-memory/in-memory-court-blocked-dates-repository.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'

let usersRepository: UsersRepository
let courtBlockedDatesRepository: CourtBlockedDatesRepository
let sportCourtsRepository: SportCourtsRepository
let sut: RestrictCourtDateUseCase

describe('Restrict Court Dates Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        courtBlockedDatesRepository = new InMemoryCourtBlockedDatesRepository()
        sportCourtsRepository = new InMemorySportCourtsRepository()

        sut = new RestrictCourtDateUseCase(
            sportCourtsRepository,
            courtBlockedDatesRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able restrict court date', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 10, 0))

        const owner = await usersRepository.create({
            name: 'John Doe',
            email: 'johndoe@email.com',
            password_hash: 'passworHashed'
        })

        const sportCourt = await sportCourtsRepository.create({
            owner_id: owner.id,
            title: 'SportCourt 1',
            type: 'none',
            location: 'Shopping Jardim Sul',
            latitude: -23.6305222,
            longitude: -46.7361007,
            price_per_hour: 20
        })

        const { courtBlockedDate } = await sut.execute({
            userId: sportCourt.owner_id,
            sportCourtId: sportCourt.id,
            startDate: new Date(2025, 0, 15, 8, 0),
            endDate: new Date(2025, 0, 15, 15, 0),
            reason: null
        })

        expect(courtBlockedDate).toEqual(expect.objectContaining({
            sportCourt_id: sportCourt.id,
            start_time: new Date(2025, 0, 15, 8, 0),
            end_time: new Date(2025, 0, 15, 15, 0)
        }))
    })

    it('should not be able restrict court date without authorization', async () => {
        // vi.setSystemTime(new Date(2025, 0, 13, 10, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'user-01',
            title: 'SportCourt 1',
            type: 'none',
            location: 'Shopping Jardim Sul',
            latitude: -23.6305222,
            longitude: -46.7361007,
            price_per_hour: 20
        })

        await expect(() =>
            sut.execute({
                userId: 'user-02',
                sportCourtId: sportCourt.id,
                startDate: new Date(2025, 0, 15, 18, 0),
                endDate: new Date(2025, 0, 15, 9, 0),
                reason: null
            })
        ).rejects.toBeInstanceOf(UnauthorizedToModifySportCourts)
    })
})