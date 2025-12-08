import { RefundPaymentUseCase } from "../refund-payment"
import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository"
import { PrismaPaymentsRepository } from "@/infra/repositories/prisma/prisma-payments-repository"
import { StripePaymentsGateway } from "@/infra/payment/stripe/stripe-payments-gateway"

export function makeRefundPaymentUseCase() {
    const paymentsRepository = new PrismaPaymentsRepository()
    const paymentsGatewayProvider = new StripePaymentsGateway()
    const bookingsRepository = new PrismaBookingsRepository()

    const refundPaymentUseCase = new RefundPaymentUseCase(
        paymentsRepository,
        paymentsGatewayProvider,
        bookingsRepository
    )

    return refundPaymentUseCase
}