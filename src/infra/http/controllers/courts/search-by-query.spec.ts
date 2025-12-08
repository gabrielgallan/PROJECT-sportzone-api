import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

// 2. Mock CORRETO da classe StripePaymentsGateway
vi.mock("@/infra/geocoding/locationiq/locationiq-geocoding-provider.ts", () => {
    return {
        LocationIqGeocodingProvider: vi.fn().mockImplementation(function () {
            return {
                getCordinatesFromAddress: vi.fn().mockResolvedValue({
                    latitude: -23.5070292,
                    longitude: -46.603552,
                    display_name: 'Rua Chico Pontes 921'
                }),
            }
        }),
    }
})

describe('Search sport courts by queries (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to search sport courts by location address and sport type', async () => {
        const { token } = await registerAndAuthenticateUser(app, true)

        // => Far away
        await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'SportCourt 1',
                type: 'Soccer',
                location: 'Shopping Jardim Sul',
                phone: '',
                latitude: -23.6305222,
                longitude: -46.7361007,
                price_per_hour: 20
            })

        // => Nearby
        await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'SportCourt 2',
                type: 'Basketball',
                location: 'Shopping Center Norte',
                phone: '',
                latitude: -23.5159715,
                longitude: -46.6244467,
                price_per_hour: 20
            })

        // => Nearby
        await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'SportCourt 3',
                type: 'Soccer',
                location: 'Holiday Inn Anhembi',
                phone: '',
                latitude: -23.5167237,
                longitude: -46.6388427,
                price_per_hour: 20
            })


        const nearbyCourts = await request(app.server)
            .get('/sport-courts/search')
            .set('Authorization', `Bearer ${token}`)
            .query({
                routeName: 'Rua Chico Pontes',
                number: 921,
                sportType: 'Soccer',
                page: 1
            })
            .send().expect(200)

        expect(nearbyCourts.body.sportCourts).toHaveLength(1)
    })
})