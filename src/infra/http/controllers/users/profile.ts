import type { FastifyReply, FastifyRequest } from "fastify"
import { ResourceNotFound } from "@/domain/booking/application/use-cases/errors/resource-not-found"
import { makeGetProfileUseCase } from "@/domain/booking/application/use-cases/factories/make-get-profile-use-case"


export async function profile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    try {
        const getUserProfile = makeGetProfileUseCase()

        const { user } = await getUserProfile.execute({ userId })

        return reply.status(200).send({
            ...user,
            password_hash: undefined,
        })
    } catch (err) {
        if (err instanceof ResourceNotFound) {
            return reply.status(404).send({ error: err.message })
        }

        throw err
    }
}