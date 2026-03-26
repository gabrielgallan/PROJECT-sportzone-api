import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MaxBookingsPerDayError } from "@/domain/booking/application/use-cases/errors/max-bookings-per-day-error";
import { makeCreateBookingUseCase } from "@/domain/booking/application/use-cases/factories/make-create-booking-use-case";
import { ResourceNotFound } from "@/domain/booking/application/use-cases/errors/resource-not-found";
import { InvalidTimestampBookingInterval } from "@/domain/booking/application/use-cases/errors/invalid-timestamp-booking-interval";
import { SportCourtDateAlreadyOccupied } from "@/domain/booking/application/use-cases/errors/sport-courts-date-already-occupied";
import { makeCreatePaymentIntentUseCase } from "@/domain/booking/application/use-cases/factories/make-create-payment-intent-use-case";
import { SportCourtUnavailable } from "@/domain/booking/application/use-cases/errors/sport-court-unavailable";
import { SportCourtDateBlocked } from "@/domain/booking/application/use-cases/errors/sport-court-date-blocked";

export async function create(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        startTime: z.coerce.date(),
        endTime: z.coerce.date()
    })

    const routeParamsSchema = z.object({
        sportCourtId: z.string().uuid()
    })

    const { startTime, endTime } = bodySchema.parse(request.body)
    const { sportCourtId } = routeParamsSchema.parse(request.params)

    const createBookingUseCase = makeCreateBookingUseCase()
    const createPaymentIntentUseCase = makeCreatePaymentIntentUseCase()

    try {
        const { booking } = await createBookingUseCase.execute({
            userId: request.user.sub,
            sportCourtId,
            startTime,
            endTime
        })

        const {
            payment, paymentSessionId, paymentSessionUrl
        } = await createPaymentIntentUseCase.execute({ booking })

        return reply.status(201).send({
            paymentSessionUrl,
            bookingId: booking.id
        })
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        if (err instanceof SportCourtUnavailable) {
            return reply.status(503).send({ error: err.message })
        }

        if (err instanceof InvalidTimestampBookingInterval) {
            return reply.status(400).send({ error: err.message })
        }

        if (err instanceof MaxBookingsPerDayError) {
            return reply.status(409).send({ error: err.message })
        }

        if (err instanceof SportCourtDateAlreadyOccupied) {
            return reply.status(409).send({ error: err.message })
        }

        if (err instanceof SportCourtDateBlocked) {
            return reply.status(503).send({ error: err.message })
        }

        throw err
    }
}