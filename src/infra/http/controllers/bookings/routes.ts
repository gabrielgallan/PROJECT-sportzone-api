import type { FastifyInstance } from "fastify"
import { verifyJWT } from "@/infra/http/middlewares/verify-jwt.ts"
import { create } from "./create.ts"
import { history } from "./history.ts"
// import { cancel } from "./cancel.ts"


export async function bookingsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJWT)

    app.post('/sport-courts/:sportCourtId/bookings', create)
    app.get('/bookings/history', history)
    // app.patch('/bookings/:bookingId/confirmation', cancel)
}