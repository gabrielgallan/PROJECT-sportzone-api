import { it, describe, expect, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'
import type { BookingsRepository } from '@/domain/repositories/bookings-repository.ts'
import { BookingStatus } from '@prisma/client'
import { InvalidBookingStatus } from './errors/invalid-booking-status-error.ts'
import { CancelBookingUseCase } from './cancel-booking.ts'
import { LateBookingCancellation } from './errors/late-booking-cancellation.ts'

let bookingRepository: BookingsRepository
let sut: CancelBookingUseCase

describe('Cancel a booking register Use Case', () => {
    beforeEach(() => {
        bookingRepository = new InMemoryBookingsRepository()

        sut = new CancelBookingUseCase(bookingRepository)

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to cancel a booking with at least 2 hours notice.', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 10, 0))

        const createdBooking = await bookingRepository.create({
            user_id: 'user-01',
            sportCourt_id: 'court-01',
            start_time: new Date(2025, 0, 13, 14, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: 60
        })

        await bookingRepository.save({
            ...createdBooking,
            status: 'CONFIRMED'
        })

        const { booking } = await sut.execute({
            bookingId: createdBooking.id
        })

        expect(booking.status).toBe(BookingStatus.CANCELLED)
    })

    it('should not be able to cancel a booking without at least 2 hours notice.', async () => {
        vi.setSystemTime(new Date(2025, 0, 10, 12, 0))

        const createdBooking = await bookingRepository.create({
            user_id: 'user-01',
            sportCourt_id: 'court-01',
            start_time: new Date(2025, 0, 13, 14, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: 60
        })

        await bookingRepository.save({
            ...createdBooking,
            status: 'CONFIRMED'
        })

        vi.setSystemTime(new Date(2025, 0, 13, 13, 30))

        await expect(() =>
            sut.execute({
                bookingId: createdBooking.id
            })
        ).rejects.toBeInstanceOf(LateBookingCancellation)
    })

    it('should not be able to cancel a booking already cancelled.', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 10, 0))

        const createdBooking = await bookingRepository.create({
            user_id: 'user-01',
            sportCourt_id: 'court-01',
            start_time: new Date(2025, 0, 13, 14, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: 60,
            status: 'CANCELLED'
        })

        vi.setSystemTime(new Date(2025, 0, 13, 11, 30))

        await expect(() =>
            sut.execute({
                bookingId: createdBooking.id
            })
        ).rejects.toBeInstanceOf(InvalidBookingStatus)
    })
})