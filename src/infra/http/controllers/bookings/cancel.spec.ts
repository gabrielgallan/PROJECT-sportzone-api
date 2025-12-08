import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import app from '@/app.ts'
import { registerAndAuthenticateUser } from '@/utils/test/e2e/register-and-authenticate-user.ts'
import { createSportCourt } from '@/utils/test/e2e/create-sport-court.ts'
import dayjs from 'dayjs'
import prisma from '@/infra/lib/prisma'
import { createBooking } from '@/utils/test/e2e/create-booking'

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

describe('Cancel booking (E2E)', async () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to cancel a booking', async () => {
        const { token, user } = await registerAndAuthenticateUser(app, true)
        const { sportCourtId } = await createSportCourt(app, token)

        const startTime = dayjs().add(1, "day").hour(12).minute(0).second(0).millisecond(0).toDate() // Tomorrow at twelve PM o'clock
        const endTime = dayjs().add(1, "day").hour(16).minute(0).second(0).millisecond(0).toDate() // Tomorrow at four PM o'clock
        

        const booking = await prisma.booking.create({
            data: {
                start_time: startTime,
                end_time: endTime,
                status: 'CONFIRMED',
                price: 50,
                user_id: user.id,
                sportCourt_id: sportCourtId
            }
        })

        const payment = await prisma.payment.create({
            data: {
                external_id: 'external_id',
                amount: 50,
                status: 'PAID',
                validated_at: new Date(),
                user_email: user.email,
                booking_id: booking.id
            }
        })

        const response = await request(app.server)
            .patch(`/bookings/${booking.id}/confirmation`)
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(204)
    })
})