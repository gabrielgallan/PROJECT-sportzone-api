import { Prisma, type Payment } from "@prisma/client"
import prisma from "@/infra/lib/prisma.ts"
import type { PaymentsRepository } from "@/domain/repositories/payments-repository.ts"


export class PrismaPaymentsRepository implements PaymentsRepository {
    async create(data: Prisma.PaymentUncheckedCreateInput) {
        const payment = await prisma.payment.create({
            data
        })
        
        return payment
    }
    
    async findByBookingId(bookingId: string) {
        const payment = await prisma.payment.findUnique({
            where: { 
                booking_id: bookingId
            }
        })

        return payment
    }

    async findById(id: string) {
        const payment = await prisma.payment.findUnique({
            where: { id }
        })

        return payment
    }

    async save(payment: Payment) {
        const uptPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: payment
        })

        return uptPayment
    }
}