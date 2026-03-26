import { it, describe, expect, beforeEach } from 'vitest'
import type { SportCourtsRepository } from '../../../repositories/sport-courts-repository.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'
import { SearchForNearbyCourtsUseCase } from './search-for-nearby-courts.ts'

let sportCourtsRepository: SportCourtsRepository
let sut: SearchForNearbyCourtsUseCase

describe('Search for nearby courts use case', () => {
    beforeEach(() => {
        sportCourtsRepository = new InMemorySportCourtsRepository()
        sut = new SearchForNearbyCourtsUseCase(sportCourtsRepository)
    })

    it('should be able to search for nearby user courts', async () => {
        // => Creating 2 courts far away user (+10 Km)
        for (let c = 0; c < 2; c++) {
            await sportCourtsRepository.create({
                owner_id: 'owner-01',
                title: 'Soccer SportCourt',
                type: 'Soccer',
                location: 'Shopping Jardim Sul Quadra',
                latitude: -23.475740,
                longitude: -46.749997,
                price_per_hour: 20
            })
        }

        // => Creating one court nearby user
        await sportCourtsRepository.create({
            owner_id: 'owner-02',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Vila Santa Monica Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        const { sportCourts } = await sut.execute({
            userLatitude: -23.6140472,
            userLongitude: -46.7413994,
            page: 1
        })

        expect(sportCourts).toHaveLength(1)
        expect(sportCourts[0]?.location).toBe('Vila Santa Monica Quadra')
    })
})