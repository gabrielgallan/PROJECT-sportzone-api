import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ResourceNotFound } from "@/domain/booking/application/use-cases/errors/resource-not-found";
import { makeCancelBookingUseCase } from "@/domain/booking/application/use-cases/factories/make-cancel-booking-use-case";
import { InvalidBookingStatus } from "@/domain/booking/application/use-cases/errors/invalid-booking-status-error";
import { LateBookingCancellation } from "@/domain/booking/application/use-cases/errors/late-booking-cancellation";
import { UnauthorizedToModifyBooking } from "@/domain/booking/application/use-cases/errors/unauthorized-to-modify-booking";
import { makeRefundPaymentUseCase } from "@/domain/booking/application/use-cases/factories/make-refund-payment-use-case";
import { PaymentNotPaidYet } from "@/domain/booking/application/use-cases/errors/payment-not-paid-yet";

export async function cancel(request: FastifyRequest, reply: FastifyReply) {
    const routeParamsSchema = z.object({
        bookingId: z.string()
    })

    const { bookingId } = routeParamsSchema.parse(request.params)

    const cancelBookingUseCase = makeCancelBookingUseCase()
    const refundPaymentUseCase = makeRefundPaymentUseCase()

    try {
        const { booking } = await cancelBookingUseCase.execute({
            userId: request.user.sub,
            bookingId,
        })

        const { refundId, refundStatus } = await refundPaymentUseCase.execute({
            bookingId: booking.id
        })

        return reply.status(204).send()
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        if (err instanceof InvalidBookingStatus) {
            return reply.status(400).send({ error: err.message })
        }

        if (err instanceof LateBookingCancellation) {
            return reply.status(409).send({ error: err.message })
        }

        if (err instanceof UnauthorizedToModifyBooking) {
            return reply.status(401).send({ error: err.message })
        }

        if (err instanceof PaymentNotPaidYet) {
            return reply.status(400).send({ error: err.message })
        }

        throw err
    }
}