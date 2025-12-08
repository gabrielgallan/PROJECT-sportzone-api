import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeRestrictCourtDateUseCase } from "@/domain/use-cases/factories/make-restrict-court-dates-use-case.ts";
import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
import { IncorrectTimestampInterval } from "@/domain/use-cases/errors/incorrect-timestamp-interval.ts";
import { UnauthorizedToModifySportCourts } from "@/domain/use-cases/errors/unauthorized-to-modify-court.ts";

export async function restrict(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        reason: z.string()
    })

    const paramsSchema = z.object({
        sportCourtId: z.string()
    })

    const { startDate, endDate, reason } = bodySchema.parse(request.body)
    const { sportCourtId } = paramsSchema.parse(request.params)

    try {
        const restrictCourtDateUseCase = makeRestrictCourtDateUseCase()

        const { courtBlockedDate } = await restrictCourtDateUseCase.execute({
            userId: request.user.sub,
            sportCourtId,
            startDate,
            endDate,
            reason
        })

        return reply.status(201).send({
            courtBlockedDate,
        })
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        if (err instanceof UnauthorizedToModifySportCourts) {
            return reply.status(401).send({ error: err.message })
        }

        if (err instanceof IncorrectTimestampInterval) {
            return reply.status(400).send({ error: err.message })
        }

        throw err
    }
}