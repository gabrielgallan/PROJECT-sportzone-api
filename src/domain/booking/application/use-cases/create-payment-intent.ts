import { BookingStatus, type Booking, type Payment } from "@prisma/client"
import { InvalidBookingStatus } from "./errors/invalid-booking-status-error.ts"
import type { PaymentsRepository } from "../../../repositories/payments-repository.ts"
import type { UsersRepository } from "../../../repositories/users-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import type { SportCourtsRepository } from "../../../repositories/sport-courts-repository.ts"
import type { PaymentGatewayProvider } from "../../../contracts/payment-gateway-provider.ts"
import env from "@/infra/env/config.ts"

interface CreatePaymentIntentUseCaseRequest {
    booking: Booking,
}

interface CreatePaymentIntentUseCaseResponse {
    payment: Payment,
    paymentSessionUrl: string,
    paymentSessionId: string
}

export class CreatePaymentIntentUseCase {
    constructor(
        private paymentsRepository: PaymentsRepository,
        private paymentsGatewayProvider: PaymentGatewayProvider,
        private usersRepository: UsersRepository,
        private sportCourtRepository: SportCourtsRepository
    ) { }

    async execute({
        booking
    }: CreatePaymentIntentUseCaseRequest): Promise<CreatePaymentIntentUseCaseResponse> {
        if (booking.status !== BookingStatus.PENDING) {
            throw new InvalidBookingStatus()
        }

        const user = await this.usersRepository.findByUserId(booking.user_id)

        if (!user) {
            throw new ResourceNotFound()
        }

        const sportCourt = await this.sportCourtRepository.findById(booking.sportCourt_id)

        if (!sportCourt) {
            throw new ResourceNotFound()
        }

        const payment = await this.paymentsRepository.create({
            amount: booking.price,
            currency: 'brl',
            description: `Reserva de Quadra - ${sportCourt.title}`,
            user_email: user.email,
            booking_id: booking.id,
        })

        const { sessionId, sessionUrl } = await this.paymentsGatewayProvider.createPaymentIntent({
            paymentId: payment.id,
            bookingId: payment.booking_id,
            amount: Number(payment.amount),
            currency: payment.currency,
            userEmail: payment.user_email,
            successUrl: env.FRONT_END_URL + '/checkout/success',
            cancelUrl: env.FRONT_END_URL + '/checkout/cancel',
            description: payment.description
        })

        return {
            payment,
            paymentSessionUrl: sessionUrl,
            paymentSessionId: sessionId
        }
    }
}