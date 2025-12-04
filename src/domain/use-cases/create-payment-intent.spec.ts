import { it, describe, expect, beforeEach, vi, afterEach } from 'vitest'
import { InvalidBookingStatus } from './errors/invalid-booking-status-error.ts'
import { makeUser } from '../../utils/test/unit/factories/make-user.ts'
import { makeSportCourt } from '../../utils/test/unit/factories/make-sport-court.ts'
import { makeBooking } from '../../utils/test/unit/factories/make-booking.ts'
import type { PaymentsRepository } from '../repositories/payments-repository.ts'
import type { UsersRepository } from '../repositories/users-repository.ts'
import type { SportCourtsRepository } from '../repositories/sport-courts-repository.ts'
import { CreatePaymentIntentUseCase } from './create-payment-intent.ts'
import { InMemoryPaymentsRepository } from '@/infra/repositories/in-memory/in-memory-payments-repository.ts'
import { InMemoryUsersRepository } from '@/infra/repositories/in-memory/in-memory-users-repository.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'
import type { PaymentGatewayProvider } from '../contracts/payment-gateway-provider.ts'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'


let paymentsRepository: PaymentsRepository
let paymentGatewayProvider: PaymentGatewayProvider
let usersRepository: UsersRepository
let sportCourtRepository: SportCourtsRepository

let sut: CreatePaymentIntentUseCase

describe('Create payment intent to booking Use Case', () => {
    beforeEach(() => {
        paymentsRepository = new InMemoryPaymentsRepository()
        paymentGatewayProvider = {
            createPaymentIntent: vi.fn().mockResolvedValue({
                sessionId: 'mock-session-id',
                sessionUrl: 'https://mock-session-url',
            }),
            confirmPayment: vi.fn().mockResolvedValue({}),
            refundPayment: vi.fn().mockResolvedValue({})
        }
        usersRepository = new InMemoryUsersRepository()
        sportCourtRepository = new InMemorySportCourtsRepository()

        sut = new CreatePaymentIntentUseCase(
            paymentsRepository,
            paymentGatewayProvider,
            usersRepository,
            sportCourtRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to create payment register to booking', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const bookingsRepository = new InMemoryBookingsRepository()

        const user = await makeUser(usersRepository)
        const sportCourt = await makeSportCourt(sportCourtRepository, user)
        const booking = await makeBooking(bookingsRepository, user, sportCourt)

        const { payment, paymentSessionId, paymentSessionUrl } = await sut.execute({
            booking
        })

        expect(payment.id).toEqual(expect.any(String))
        expect(paymentSessionId).toBe('mock-session-id')
        expect(paymentSessionUrl).toBe('https://mock-session-url')
    })

    it('should not be able to create payment register to a booking already confirmed', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const user = await makeUser(usersRepository)
        const sportCourt = await makeSportCourt(sportCourtRepository, user)

        const booking = await new InMemoryBookingsRepository().create({
            status: 'CONFIRMED',
            user_id: user.id,
            sportCourt_id: sportCourt.id,
            start_time: new Date(2025, 0, 13, 12, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: 80
        })

        await expect(() => 
            sut.execute({
                booking
            })
        ).rejects.toBeInstanceOf(InvalidBookingStatus)
    })
})