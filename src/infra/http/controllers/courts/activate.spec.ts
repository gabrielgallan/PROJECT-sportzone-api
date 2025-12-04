import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

describe('Activate sport court (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to activate sport court availability', async () => {
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
            }).expect(201)
        
        const { sportCourtId } = createResponse.body

        const activateResponse = await request(app.server)
            .patch(`/sport-courts/${sportCourtId}/unavailability`)
            .set('Authorization', `Bearer ${token}`)
            .send().expect(204)
    })
})