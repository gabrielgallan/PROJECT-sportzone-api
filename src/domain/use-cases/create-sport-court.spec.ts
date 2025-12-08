import { it, describe, expect, beforeEach } from 'vitest'
import type { SportCourtsRepository } from '../repositories/sport-courts-repository.ts'
import { CreateSportCourtUseCase } from './create-sport-court.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'

let sportCourtsRepository: SportCourtsRepository
let sut: CreateSportCourtUseCase

describe('Create Sport Court Use Case', () => {
    beforeEach(() => {
        sportCourtsRepository = new InMemorySportCourtsRepository()
        sut = new CreateSportCourtUseCase(sportCourtsRepository)
    })

    it('should be able to create sport court.', async () => {
        const { sportCourt } = await sut.execute({
            owner_id: 'user-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        expect(sportCourt).toEqual(expect.objectContaining({
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
        }))
    })
})