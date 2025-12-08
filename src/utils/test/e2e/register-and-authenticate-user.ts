import { UserRole } from "@prisma/client"
import { hash } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import prisma from "@/infra/lib/prisma.ts"
import request from "supertest"

export async function registerAndAuthenticateUser(app: FastifyInstance, isAdmin = false) {
    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'johndoe@example.com',
            password_hash: await hash('123456', 6),
            role: isAdmin ? UserRole.ADMIN : UserRole.MEMBER 
        }
    })

    const authResponse = await request(app.server).post('/sessions')
        .send({
            email: 'johndoe@example.com',
            password: '123456'
        })

    const { token } = authResponse.body

    return {
        token,
        user
    }
}