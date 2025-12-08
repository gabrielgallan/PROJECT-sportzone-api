import { PaymentStatus, type Payment } from "@prisma/client"
import type { PaymentsRepository } from "../repositories/payments-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import { PaymentAlreadyPaid } from "./errors/payment-already-paid.ts"

interface ValidatePaymentUseCaseRequest {
    paymentId: string,
    paymentExternalId?: string
}

interface ValidatePaymentUseCaseResponse {
    payment: Payment,
}

export class ValidatePaymentUseCase {
    constructor(
        private paymentsRepository: PaymentsRepository,
    ) {}

    async execute({
        paymentId,
        paymentExternalId
    }: ValidatePaymentUseCaseRequest): Promise<ValidatePaymentUseCaseResponse>
    {
        const paymentExists = await this.paymentsRepository.findById(paymentId)

        if (!paymentExists) {
            throw new ResourceNotFound()
        }
        
        if (paymentExists.validated_at) {
            throw new PaymentAlreadyPaid()
        }

        const payment = await this.paymentsRepository.save({
            ...paymentExists,
            external_id: paymentExternalId ?? null,
            status: PaymentStatus.PAID,
            validated_at: new Date()
        })

        return {
            payment,
        }
    }
}