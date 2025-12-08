import dayjs from "dayjs"
import type { FastifyInstance } from "fastify"
import request from "supertest"

export async function createBooking(app: FastifyInstance, token: string, sportCourtId: string) {
    const startTime = dayjs().add(1, "day").hour(12).minute(0).second(0).millisecond(0).toDate() // Tomorrow at twelve PM o'clock
    const endTime = dayjs().add(1, "day").hour(16).minute(0).second(0).millisecond(0).toDate() // Tomorrow at four PM o'clock

    const response = await request(app.server)
        .post(`/sport-courts/${sportCourtId}/bookings`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            startTime,
            endTime,
        })
        .expect(201)

    return {
        bookingId: response.body.bookingId,
    }
}