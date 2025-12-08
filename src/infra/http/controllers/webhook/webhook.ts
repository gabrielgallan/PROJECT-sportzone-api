import type { FastifyReply, FastifyRequest } from "fastify";
import type Stripe from "stripe";
import z from "zod";

import env from "@/infra/env/config.ts";
import { makeConfirmBookingUseCase } from "@/domain/use-cases/factories/make-confirm-booking-use-case.ts";
import { makeValidatePaymentUseCase } from "@/domain/use-cases/factories/make-validate-payment-use-case.ts";
import { makeUpdateBookingStatusUseCase } from "@/domain/use-cases/factories/make-update-booking-status-use-case.ts";
import { makeStripeClient } from "@/infra/payment/stripe/stripe-client";

export async function webhook(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const sig = request.headers['stripe-signature']

    let event

    if (!sig) {
        throw new Error()
    }

    const stripe = makeStripeClient()

    try {
        event = stripe.webhooks.constructEvent(
            request.rawBody as Buffer,
            sig,
            env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return reply.status(400).send(`Webhook Error`)
    }

    const session = event.data.object as Stripe.Checkout.Session
    const eventType = event.type

    const metadataSchema = z.object({
        bookingId: z.string(),
        paymentId: z.string()
    })

    const { bookingId, paymentId } = metadataSchema.parse(session.metadata)

    const confirmBookingUseCase = makeConfirmBookingUseCase()
    const validatePaymentUseCase = makeValidatePaymentUseCase()
    const updateBookingStatusUseCase = makeUpdateBookingStatusUseCase()

    switch (eventType) {
        case 'checkout.session.completed':
            await validatePaymentUseCase.execute({
                paymentId,
            })

            await confirmBookingUseCase.execute({
                bookingId,
            })

            return reply.status(200).send()
        case 'checkout.session.async_payment_failed':
            await updateBookingStatusUseCase.execute({
                bookingId,
                bookingStatus: 'ERROR'
            })

            return reply.status(200).send()
        case 'checkout.session.expired':
            await updateBookingStatusUseCase.execute({
                bookingId,
                bookingStatus: 'ERROR'
            })
            
            return reply.status(200).send()
        case 'checkout.session.async_payment_succeeded':
            await validatePaymentUseCase.execute({
                paymentId,
            })

            await confirmBookingUseCase.execute({
                bookingId,
            })
            return reply.status(200).send()
        default:
            return reply.status(200).send()
    }
}