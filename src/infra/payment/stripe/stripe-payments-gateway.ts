import type { ConfirmPaymentRequest, ConfirmPaymentResponse, CreatePaymentIntentRequest, PaymentGatewayProvider, RefundPaymentRequest, RefundPaymentResponse } from "@/domain/contracts/payment-gateway-provider.ts";
import { makeStripeClient } from "./stripe-client";
import type Stripe from "stripe";

const timeLimitForExpirationInMinutes = 35

export class StripePaymentsGateway implements PaymentGatewayProvider {
    private client: Stripe
    
    constructor() {
        this.client = makeStripeClient()
    }

    async createPaymentIntent({
        paymentId,
        bookingId,
        userEmail,
        amount,
        currency,
        description,
        successUrl,
        cancelUrl
    }: CreatePaymentIntentRequest) {
        const session = await this.client.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: description,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe usa centavos
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                paymentId: paymentId,
                bookingId: bookingId,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            expires_at: Math.floor(Date.now() / 1000) + timeLimitForExpirationInMinutes * 60,
        })

        return {
            sessionId: session.id,
            sessionUrl: session.url!,
        }
    }

    async refundPayment({ paymentIntentId, amount }: RefundPaymentRequest) {
        const refund = await this.client.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100)
        })

        return {
            refundId: refund.id,
            refundStatus: refund.status
        }
    }

    confirmPayment(params: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
        throw new Error("Method not implemented.");
    }
}