import type { Stripe } from "stripe";
import z from "zod";
import { makeUpdateBookingStatusUseCase } from "@/domain/use-cases/factories/make-update-booking-status-use-case";

export async function checkoutFaileddHandler(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session

    const metadataSchema = z.object({
        bookingId: z.string(),
        paymentId: z.string()
    })

    const { bookingId, paymentId } = metadataSchema.parse(session.metadata)

    const updateBookingStatusUseCase = makeUpdateBookingStatusUseCase()

    await updateBookingStatusUseCase.execute({
        bookingId,
        bookingStatus: 'ERROR'
    })
}
