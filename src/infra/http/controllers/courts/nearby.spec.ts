import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

describe('Search for nearby sport courts (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to search for nearby sport courts', async () => {
        const { token } = await registerAndAuthenticateUser(app ,true)

        await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Soccer SportCourt',
                type: 'Soccer',
                phone: '',
                location: 'Shopping Jardim Sul Quadra',
                latitude: -23.475740,
                longitude: -46.749997,
                price_per_hour: 20
            }).expect(201)

        await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Volei SportCourt',
                type: 'Volei',
                phone: '',
                location: 'Vila Santa Monica Quadra',
                latitude: -23.630180,
                longitude: -46.735809,
                price_per_hour: 20
            }).expect(201)

        const nearbyCourtsResponse = await request(app.server)
            .get('/sport-courts/search/nearby')
            .set('Authorization', `Bearer ${token}`)
            .query({
                userLatitude: -23.6140472,
                userLongitude: -46.7413994,
                page: 1
            })
            .send().expect(200)
        
        expect(nearbyCourtsResponse.body.sportCourts).toHaveLength(1)
        expect(nearbyCourtsResponse.body.sportCourts[0])
            .toEqual(expect.objectContaining({
                title: 'Volei SportCourt',
                type: 'Volei',
                location: 'Vila Santa Monica Quadra',
                latitude: '-23.63018',
                longitude: '-46.735809',
                price_per_hour: '20'
            }))
    })
})