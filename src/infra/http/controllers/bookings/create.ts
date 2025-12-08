import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MaxBookingsPerDayError } from "@/domain/use-cases/errors/max-bookings-per-day-error.ts";
import { makeCreateBookingUseCase } from "@/domain/use-cases/factories/make-create-booking-use-case.ts";
import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
import { InvalidTimestampBookingInterval } from "@/domain/use-cases/errors/invalid-timestamp-booking-interval.ts";
import { SportCourtDateAlreadyOccupied } from "@/domain/use-cases/errors/sport-courts-date-already-occupied.ts";
import { makeCreatePaymentIntentUseCase } from "@/domain/use-cases/factories/make-create-payment-intent-use-case.ts";
import { SportCourtUnavailable } from "@/domain/use-cases/errors/sport-court-unavailable.ts";
import { SportCourtDateBlocked } from "@/domain/use-cases/errors/sport-court-date-blocked.ts";

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