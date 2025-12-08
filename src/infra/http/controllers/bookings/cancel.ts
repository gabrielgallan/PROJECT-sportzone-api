// import type { FastifyReply, FastifyRequest } from "fastify";
// import z from "zod";
// import { ResourceNotFound } from "@/domain/use-cases/errors/resource-not-found.ts";
// import { makeCancelBookingUseCase } from "@/domain/use-cases/factories/make-cancel-booking-use-case";

// export async function cancel(request: FastifyRequest, reply: FastifyReply) {
//     const paramsSchema = z.object({
//         page: z.coerce.number(),
//         // bookingStatus: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ERROR']).optional() => Fix Use Case
//     })

//     const { page } = paramsSchema.parse(request.query)

//     const cancelBookingUseCase = makeCancelBookingUseCase()
    
//     try {
//         const { booking } = await cancelBookingUseCase.execute({
//             bookingId: '01'
//         })

//         return reply.status(200).send({ bookings })
//     } catch (err) {
//         if (err instanceof ResourceNotFound) {
//             return reply.status(404).send({ error: err.message })    
//         }

//         throw err
//     }
// }