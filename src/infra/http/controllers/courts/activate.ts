import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
import { makeActivateSportCourtAvailabilityUseCase } from "@/domain/use-cases/factories/make-activate-court-availability-use-case.ts";
import { UnauthorizedToModifySportCourts } from "@/domain/use-cases/errors/unauthorized-to-modify-court.ts";

export async function activate(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        sportCourtId: z.string().nonempty()
    })

    const { sportCourtId } = paramsSchema.parse(request.params)

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