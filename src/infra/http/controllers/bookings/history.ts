import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
import { makeFetchUserBookingsHistoryUseCase } from "@/domain/use-cases/factories/make-fetch-user-bookings-history-use-case";

export async function history(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        page: z.coerce.number(),
        // bookingStatus: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ERROR']).optional() => Fix Use Case
    })

    const { page } = paramsSchema.parse(request.query)

    const fetchUserBookingsUseCase = makeFetchUserBookingsHistoryUseCase()
    
    try {
        const { bookings } = await fetchUserBookingsUseCase.execute({
            userId: request.user.sub,
            page: page
        })

        return reply.status(200).send({ bookings })
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })    
        }

        throw err
    }
}