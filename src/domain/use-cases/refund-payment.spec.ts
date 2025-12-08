import { it, describe, expect, beforeEach, vi, afterEach } from 'vitest'
import { RefundPaymentUseCase } from './refund-payment'
import { InMemoryPaymentsRepository } from '@/infra/repositories/in-memory/in-memory-payments-repository'
import { PaymentsRepository } from '../repositories/payments-repository'
import { BookingsRepository } from '../repositories/bookings-repository'
import { PaymentGatewayProvider } from '../contracts/payment-gateway-provider'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository'
import { makeBooking } from '@/utils/test/unit/factories/make-booking'
import { makePayment } from '@/utils/test/unit/factories/make-payment'
import { InvalidBookingStatus } from './errors/invalid-booking-status-error'
import { PaymentNotPaidYet } from './errors/payment-not-paid-yet'

let paymentsRepository: PaymentsRepository
let paymentsGatewayProvider: PaymentGatewayProvider
let bookingsRepository: BookingsRepository

let sut: RefundPaymentUseCase

describe("Refund payment Use Case", () => {
    beforeEach(() => {
        paymentsRepository = new InMemoryPaymentsRepository()
        paymentsGatewayProvider = {
            createPaymentIntent: vi.fn().mockResolvedValue({}),
            refundPayment: vi.fn().mockResolvedValue({
                refundId: 'refund_test_id',
                refundStatus: 'completed'
            }),
            confirmPayment: vi.fn().mockResolvedValue({})
        }
        bookingsRepository = new InMemoryBookingsRepository()

        sut = new RefundPaymentUseCase(
            paymentsRepository,
            paymentsGatewayProvider,
            bookingsRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("should be able to refund a payment already paid", async () => {
        const booking = await makeBooking(bookingsRepository)
        const payment = await makePayment(paymentsRepository, true, booking)

        await bookingsRepository.save({
            ...booking,
            status: 'CANCELLED'
        })

        const { refundId, refundStatus } = await sut.execute({
            bookingId: booking.id
        })

        expect(refundId).toBe('refund_test_id')
        expect(refundStatus).toBe('completed')
    })

    it("should not be able to refund a payment of a booking not cancelled", async () => {
        const booking = await makeBooking(bookingsRepository)
        const payment = await makePayment(paymentsRepository, false, booking)

        await expect(() =>
            sut.execute({
                bookingId: booking.id
            })
        ).rejects.toBeInstanceOf(InvalidBookingStatus)
    })

    it("should not be able to refund a payment not paid yet.", async () => {
        const booking = await makeBooking(bookingsRepository)
        const payment = await makePayment(paymentsRepository, false, booking)

        await bookingsRepository.save({
            ...booking,
            status: 'CANCELLED'
        })

        await expect(() =>
            sut.execute({
                bookingId: booking.id
            })
        ).rejects.toBeInstanceOf(PaymentNotPaidYet)
    })
})