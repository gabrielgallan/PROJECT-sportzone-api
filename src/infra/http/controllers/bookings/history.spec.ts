import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import app from '@/app.ts'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'
import { createSportCourt } from '@/utils/test/e2e/create-sport-court.ts'
import dayjs from 'dayjs'

// 1. Mock CORRETO da classe StripePaymentsGateway
vi.mock("@/infra/payment/stripe/stripe-payments-gateway.ts", () => {
  return {
    StripePaymentsGateway: vi.fn().mockImplementation(function () {
      return {
        createPaymentIntent: vi.fn().mockResolvedValue({
          sessionId: "cs_test_123",
          sessionUrl: "https://stripe.test/session",
        }),
        refundPayment: vi.fn().mockResolvedValue({
        }),
        confirmPayment: vi.fn().mockResolvedValue({
        })
      }
    }),
  }
})

describe('Fetch user bookings history (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to fetch user bookings history', async () => {
        const { token } = await registerAndAuthenticateUser(app, true)
        const { sportCourtId } = await createSportCourt(app, token)

        const startTime = dayjs().add(1, "day").hour(12).minute(0).second(0).millisecond(0).toDate() // Tomorrow at twelve PM o'clock
        const endTime = dayjs().add(1, "day").hour(16).minute(0).second(0).millisecond(0).toDate() // Tomorrow at four PM o'clock

        const createBookingResponse = await request(app.server)
            .post(`/sport-courts/${sportCourtId}/bookings`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                startTime,
                endTime,
            })
            .expect(201)
        
        const historyResponse = await request(app.server)
            .get('/bookings/history')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 1
            })
            .expect(200)

        expect(historyResponse.body.bookings).toHaveLength(1)
    })
})