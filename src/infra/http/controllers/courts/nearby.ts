import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeSearchForNearbyCourtsUseCase } from "@/domain/booking/application/use-cases/factories/make-search-for-nearby-courts-use-case";

export async function nearby(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
        userLatitude: z.coerce.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        userLongitude: z.coerce.number().refine(value => {
            return Math.abs(value) <= 180
        }),
        page: z.coerce.number().min(1).default(1)
    })

    const { userLatitude, userLongitude, page } = querySchema.parse(request.query)

    const searchForNearbyCourtsUseCase = makeSearchForNearbyCourtsUseCase()

    const { sportCourts } = await searchForNearbyCourtsUseCase.execute({
        userLatitude,
        userLongitude,
        page
    })

    return reply.status(200).send({ sportCourts })
}