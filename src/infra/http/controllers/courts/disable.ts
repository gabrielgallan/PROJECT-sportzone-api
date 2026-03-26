import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

// * Factories
import { makeDisableSportCourtAvailabilityUseCase } from "@/domain/booking/application/use-cases/factories/make-disable-court-availability-use-case";

// * Errors
import { SportCourtAlreadyDisabled } from "@/domain/booking/application/use-cases/errors/sport-court-already-disabled";
import { ResourceNotFound } from "@/domain/booking/application/use-cases/errors/resource-not-found";
import { UnauthorizedToModifySportCourts } from "@/domain/booking/application/use-cases/errors/unauthorized-to-modify-court";

export async function disable(request: FastifyRequest, reply: FastifyReply) {
    const routeParamsSchema = z.object({
        sportCourtId: z.string().nonempty()
    })

    const { sportCourtId } = routeParamsSchema.parse(request.params)

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