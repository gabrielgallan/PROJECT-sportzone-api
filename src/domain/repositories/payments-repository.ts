import type { Payment, Prisma } from "@prisma/client"

export interface PaymentsRepository {
    create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment>
    findById(id: string): Promise<Payment | null>
    save(payment: Payment): Promise<Payment>
}