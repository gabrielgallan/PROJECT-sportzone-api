import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ResourceNotFound } from "@/domain/booking/application/use-cases/errors/resource-not-found";
import { makeActivateSportCourtAvailabilityUseCase } from "@/domain/booking/application/use-cases/factories/make-activate-court-availability-use-case";
import { UnauthorizedToModifySportCourts } from "@/domain/booking/application/use-cases/errors/unauthorized-to-modify-court";

export async function activate(request: FastifyRequest, reply: FastifyReply) {
    const routeParamsSchema = z.object({
        sportCourtId: z.string().nonempty()
    })

    const { sportCourtId } = routeParamsSchema.parse(request.params)

    try {
        const activateSportCourtUseCase = makeActivateSportCourtAvailabilityUseCase()

        await activateSportCourtUseCase.execute({
            userId: request.user.sub,
            sportCourtId
        })

        return reply.status(204).send()
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        if (err instanceof UnauthorizedToModifySportCourts) {
            return reply.status(401).send({ error: err.message })
        }

        throw err
    }
}