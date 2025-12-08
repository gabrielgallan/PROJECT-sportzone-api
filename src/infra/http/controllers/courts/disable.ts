import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

// * Factories
import { makeDisableSportCourtAvailabilityUseCase } from "@/domain/use-cases/factories/make-disable-court-availability-use-case.ts";

// * Errors
import { SportCourtAlreadyDisabled } from "@/domain/use-cases/errors/sport-court-already-disabled.ts";
import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
import { UnauthorizedToModifySportCourts } from "@/domain/use-cases/errors/unauthorized-to-modify-court.ts";

export async function disable(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        sportCourtId: z.string().nonempty()
    })

    const { sportCourtId } = paramsSchema.parse(request.params)

    try {
        const disableSportCourtUseCase = makeDisableSportCourtAvailabilityUseCase()

        await disableSportCourtUseCase.execute({
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

        if (err instanceof SportCourtAlreadyDisabled) {
            return reply.status(409).send({ error: err.message })
        }

        throw err
    }
}