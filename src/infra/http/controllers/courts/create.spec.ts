import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

describe('Create Sport court (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to create a sport court', async () => {
        const { token } = await registerAndAuthenticateUser(app, true)

        const response = await request(app.server).post('/sport-courts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Soccer SportCourt',
                type: 'Soccer',
                phone: '',
                location: 'Nonexisting Street',
                latitude: -23.630180,
                longitude: -46.735809,
                price_per_hour: 20
            }).expect(201)
        
        expect(response.body).toEqual(expect.objectContaining({
            sportCourtId: expect.any(String)
        }))
    })
})