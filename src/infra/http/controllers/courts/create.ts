import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeCreateSportCourtUseCase } from "@/domain/booking/application/use-cases/factories/make-create-sport-court-use-case";

export async function create(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        title: z.string(),
        type: z.string(),
        phone: z.string().nullable(),
        location: z.string(),
        latitude: z.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        longitude: z.number().refine(value => {
            return Math.abs(value) <= 180
        }),
        price_per_hour: z.coerce.number()
    })

    const body = bodySchema.parse(request.body)

    const createSportCourtUseCase = makeCreateSportCourtUseCase()

    const { sportCourt } = await createSportCourtUseCase.execute({
        ...body,
        owner_id: request.user.sub
    })

    return reply.status(201).send({ sportCourtId: sportCourt.id })
}