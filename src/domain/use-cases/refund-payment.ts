import { BookingStatus, PaymentStatus, type Payment } from "@prisma/client"
import type { PaymentsRepository } from "../repositories/payments-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import { PaymentGatewayProvider } from "../contracts/payment-gateway-provider.ts"
import { PaymentNotPaidYet } from "./errors/payment-not-paid-yet.ts"
import { BookingsRepository } from "../repositories/bookings-repository.ts"
import { InvalidBookingStatus } from "./errors/invalid-booking-status-error.ts"

interface RefundPaymentUseCaseRequest {
    bookingId: string,
}

interface RefundPaymentUseCaseResponse {
    refundId: string,
    refundStatus: string | null
}

export class RefundPaymentUseCase {
    constructor(
        private paymentsRepository: PaymentsRepository,
        private paymentsGatewayProvider: PaymentGatewayProvider,
        private bookingsRepository: BookingsRepository
    ) {}

    async execute({
        bookingId
    }: RefundPaymentUseCaseRequest): Promise<RefundPaymentUseCaseResponse>
    {
        const booking = await this.bookingsRepository.findById(bookingId)

        if (!booking) {
            throw new ResourceNotFound()
        }
        
        const payment = await this.paymentsRepository.findByBookingId(bookingId)
        
        if (!payment) {
            throw new ResourceNotFound()
        }

        if (booking.status !== BookingStatus.CANCELLED) {
            throw new InvalidBookingStatus()
        }

        if (payment.status !== PaymentStatus.PAID) {
            throw new PaymentNotPaidYet()
        }

        if (!payment.external_id) {
            throw new Error()
        }

        const { refundId, refundStatus } = await this.paymentsGatewayProvider.refundPayment({
            paymentIntentId: payment.external_id,
            amount: Number(payment.amount)
        })

        await this.paymentsRepository.save({
            ...payment,
            status: PaymentStatus.REFUNDED
        })

        return {
            refundId,
            refundStatus
        }
    }
}