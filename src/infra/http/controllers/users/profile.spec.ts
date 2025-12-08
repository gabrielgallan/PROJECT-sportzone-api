import request from 'supertest'
import app from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'

describe('Get Profile (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to get user profile', async () => {
        const { token } = await registerAndAuthenticateUser(app)

        const profileResponse = await request(app.server)
            .get('/my-profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        
        expect(profileResponse.body).toEqual(expect.objectContaining({
            name: 'John Doe',
            email: 'johndoe@example.com'
        }))
    })
})