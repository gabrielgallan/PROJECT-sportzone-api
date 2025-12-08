import type { FastifyReply, FastifyRequest } from "fastify";
import { dispatchStripeEvent } from "./events-dispatcher";

export async function webhook(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const event = (request as any).stripeEvent

    await dispatchStripeEvent(event)

    return reply.status(200).send()
}