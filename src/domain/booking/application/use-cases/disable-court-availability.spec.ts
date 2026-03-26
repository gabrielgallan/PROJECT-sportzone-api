import { it, describe, expect, beforeEach } from 'vitest'
import type { SportCourtsRepository } from '../../../repositories/sport-courts-repository.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'
import { DisableSportCourtAvailabilityUseCase } from './disable-court-availability.ts'
import type { UsersRepository } from '../../../repositories/users-repository.ts'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { UnauthorizedToModifySportCourts } from './errors/unauthorized-to-modify-court.ts'
import { SportCourtAlreadyDisabled } from './errors/sport-court-already-disabled.ts'

let usersRepository: UsersRepository
let sportCourtsRepository: SportCourtsRepository
let sut: DisableSportCourtAvailabilityUseCase

describe('Disable sport court availability Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sportCourtsRepository = new InMemorySportCourtsRepository()
        sut = new DisableSportCourtAvailabilityUseCase(sportCourtsRepository)
    })

    it('should be able to disable sport court availability', async () => {
        const owner = await usersRepository.create({
            name: 'John Doe',
            email: 'johndoe@email.com',
            password_hash: 'passworHashed'
        })

        const sportCourt = await sportCourtsRepository.create({
            owner_id: owner.id,
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await sut.execute({
            userId: sportCourt.owner_id,
            sportCourtId: sportCourt.id
        })

        expect(sportCourt.is_active).toBe(false)
    })

    it('should not be able to disable a sport court without authorization', async () => {
        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'user-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await expect(() =>
            sut.execute({
                userId: 'user-02',
                sportCourtId: sportCourt.id
            })
        ).rejects.toBeInstanceOf(UnauthorizedToModifySportCourts)
    })

    it('should not be able to disable a sport court already disabled', async () => {
        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'user-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20,
            is_active: false
        })

        await expect(() =>
            sut.execute({
                userId: 'user-01',
                sportCourtId: sportCourt.id
            })
        ).rejects.toBeInstanceOf(SportCourtAlreadyDisabled)
    })
})