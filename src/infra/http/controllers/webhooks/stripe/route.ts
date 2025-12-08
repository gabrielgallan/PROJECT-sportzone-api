import type { FastifyInstance } from "fastify"
import { webhook } from "./webhook.ts"
import { verifyStripeSign } from "../../../middlewares/verify-stripe-sign.ts"


export async function stripeWebhookRoutes(app: FastifyInstance) {
    app.route({
        method: 'POST',
        url: '/stripe/webhook',
        config: {
            rawBody: true
        },
        preHandler: verifyStripeSign,
        handler: webhook
    })
}