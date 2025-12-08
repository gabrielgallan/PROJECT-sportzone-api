import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeSearchCourtsByQueryUseCase } from "@/domain/use-cases/factories/make-search-courts-by-query-use-case.ts";
import { AddressNotFound } from "@/infra/geocoding/locationiq/errors/address-not-found.ts";
import { LocationIqServerError } from "@/infra/geocoding/locationiq/errors/locationiq-server-error.ts";
import { InternalServerError } from "@/infra/geocoding/locationiq/errors/internal-server-error.ts";

export async function query(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
        routeName: z.string().nonempty(),
        number: z.coerce.number(),
        sportType: z.string().optional(),
        page: z.coerce.number().min(1).default(1)
    })

    const { routeName, number, sportType, page } = querySchema.parse(request.query)

    try {
        const searchCourtsByQueryUseCase = makeSearchCourtsByQueryUseCase()

        const { sportCourts } = await searchCourtsByQueryUseCase.execute({
            routeName,
            number,
            sportType: sportType ?? null,
            page
        })

        return reply.status(200).send({ sportCourts })
    } catch (err) {
        if (err instanceof AddressNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        if (err instanceof LocationIqServerError) {
            return reply.status(502).send({ error: err.message })
        }

        if (err instanceof InternalServerError) {
            return reply.status(501).send({ error: err.message })
        }

        throw err
    }
}