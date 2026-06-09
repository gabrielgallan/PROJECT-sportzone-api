import { CreatePaymentIntentUseCase } from "../create-payment-intent.ts"
import { PrismaUsersRepository } from "@/infra/repositories/prisma/prisma-users-repository.ts"
import { PrismaPaymentsRepository } from "@/infra/repositories/prisma/prisma-payments-repository.ts"
import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { StripePaymentsGateway } from "@/infra/payment/stripe/stripe-payments-gateway.ts"

export function makeCreatePaymentIntentUseCase() {
    const paymentsRepository = new PrismaPaymentsRepository()
    const paymentsGatewayProvider = new StripePaymentsGateway()
    const usersRepository = new PrismaUsersRepository()
    const sportCourtsRepository = new PrismaSportCourtsRepository()

    const createPaymentIntentUseCase = new CreatePaymentIntentUseCase(
        paymentsRepository,
        paymentsGatewayProvider,
        usersRepository,
        sportCourtsRepository
    )

    return createPaymentIntentUseCase
}