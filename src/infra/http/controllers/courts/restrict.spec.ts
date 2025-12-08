import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

describe('Restrict sport court date (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to restrict sport court date', async () => {
        const { token } = await registerAndAuthenticateUser(app, true)

        const createResponse = await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Soccer SportCourt',
                type: 'Soccer',
                phone: '',
                location: 'Nonexisting Street',
                latitude: -23.630180,
                longitude: -46.735809,
                price_per_hour: 20
            })

        const { sportCourtId } = createResponse.body

        const response = await request(app.server)
            .post(`/sport-courts/${sportCourtId}/restriction`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                startDate: new Date(2025, 10, 10, 12, 0),
                endDate: new Date(2025, 10, 10, 18, 0),
                reason: ''
            }).expect(201)

        expect(response.body).toEqual(expect.objectContaining({
            courtBlockedDate: {
                id: expect.any(String),
                reason: '',
                start_time: expect.any(String),
                end_time: expect.any(String),
                sportCourt_id: expect.any(String)
            }
        }))
    })
})