import type { FastifyReply, FastifyRequest } from "fastify";
import { UserAlreadyExistsError } from "@/domain/use-cases/errors/user-already-exists.ts";
import { makeRegisterUseCase } from "@/domain/use-cases/factories/make-register-use-case.ts";
import z from "zod";

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
    })
    
    const { name, email, password } = bodySchema.parse(request.body)
    
    try {
        const registerUseCase = makeRegisterUseCase()

        const user = await registerUseCase.execute({ name, email, password })

        return reply.status(201).send()
    } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ error: err.message })    
        }

        throw err
    }
}