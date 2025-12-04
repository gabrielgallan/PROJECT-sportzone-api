import { PrismaPaymentsRepository } from "@/infra/repositories/prisma/prisma-payments-repository.ts"
import { ValidatePaymentUseCase } from "../validate-payment.ts"

export function makeValidatePaymentUseCase() {
    const paymentsRepository = new PrismaPaymentsRepository()

    const validatePaymentUseCase = new ValidatePaymentUseCase(
        paymentsRepository,
    )

    return validatePaymentUseCase
}