import type { FastifyReply, FastifyRequest } from "fastify";
import { InvalidCredentialsError } from "@/domain/use-cases/errors/invalid-credentials-error.ts";
import { makeAuthenticateUseCase } from "@/domain/use-cases/factories/make-authenticate-use-case.ts";
import z from "zod";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const { email, password } = bodySchema.parse(request.body)
    
    try {
        const authenticateUseCase = makeAuthenticateUseCase()

        const { user } = await authenticateUseCase.execute({ 
            email, 
            password 
        })

        const token = await reply.jwtSign(
            {
                role: user.role
            }, 
            {
                sign: {
                    sub: user.id
                }
            }
        )

        const refreshToken = await reply.jwtSign(
            {
                role: user.role
            }, 
            {
                sign: {
                    sub: user.id,
                    expiresIn: '7d'
                }
            }
        )

        return reply
            .setCookie('refreshToken', refreshToken, {
                path: '/',
                secure: true,
                sameSite: true,
                httpOnly: true
            })
            .status(200).send({ 
                token,
            })
    } catch (err) {
        if (err instanceof InvalidCredentialsError) {
            return reply.status(401).send({ error: err.message })    
        }

        throw err
    }
}