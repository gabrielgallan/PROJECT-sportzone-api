import { FastifyRequest, FastifyReply } from "fastify";
import { makeStripeClient } from "@/infra/payment/stripe/stripe-client";
import env from "@/infra/env/config";

export async function verifyStripeSign(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const signature = request.headers["stripe-signature"]

  if (!signature) {
    return reply.status(400).send("Missing stripe signature")
  }

  const stripe = makeStripeClient()

  try {
    const event = stripe.webhooks.constructEvent(
      request.rawBody as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Jogar evento para os handlers posteriores
    (request as any).stripeEvent = event;
  } catch (error) {
    return reply.status(400).send("Invalid signature")
  }
}