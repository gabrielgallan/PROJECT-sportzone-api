import type { Stripe } from "stripe";
import { makeConfirmBookingUseCase } from "@/domain/booking/application/use-cases/factories/make-confirm-booking-use-case";
import { makeValidatePaymentUseCase } from "@/domain/booking/application/use-cases/factories/make-validate-payment-use-case";
import z from "zod";

export async function checkoutCompletedHandler(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session

    const metadataSchema = z.object({
        bookingId: z.string(),
        paymentId: z.string()
    })

    const { bookingId, paymentId } = metadataSchema.parse(session.metadata)

    const validatePaymentUseCase = makeValidatePaymentUseCase()
    const confirmBookingUseCase = makeConfirmBookingUseCase()

    await validatePaymentUseCase.execute({
        paymentId: paymentId,
        paymentExternalId: session.payment_intent!.toString(),
    })

    await confirmBookingUseCase.execute({
        bookingId: bookingId,
    })
}
