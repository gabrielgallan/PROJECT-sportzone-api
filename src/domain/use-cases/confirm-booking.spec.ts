import { it, describe, expect, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'
import type { BookingsRepository } from '@/domain/repositories/bookings-repository.ts'
import { ConfirmBookingUseCase } from './confirm-booking.ts'
import { BookingStatus } from '@prisma/client'
import { ResourceNotFound } from './errors/resource-not-found.ts'
import { InvalidBookingStatus } from './errors/invalid-booking-status-error.ts'

let bookingRepository: BookingsRepository
let sut: ConfirmBookingUseCase

describe('Confirm a booking register Use Case', () => {
    beforeEach(() => {
        bookingRepository = new InMemoryBookingsRepository()

        sut = new ConfirmBookingUseCase(bookingRepository)

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to confirm a booking', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 10, 0))

        const createdBooking = await bookingRepository.create({
            user_id: 'user-01',
            sportCourt_id: 'court-01',
            start_time: new Date(2025, 0, 13, 14, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: 60
        })

        const { booking } = await sut.execute({
            bookingId: createdBooking.id
        })

        expect(booking.status).toBe(BookingStatus.CONFIRMED)
    })

    it('should not be able to confirm an inexistent booking', async () => {
        await expect(() => 
            sut.execute({
                bookingId: 'inexistent-booking-id'
            })
        ).rejects.toBeInstanceOf(ResourceNotFound)
    })

    it('should not be able to confirm a booking without status PENDING', async () => {
        const createdBooking = await bookingRepository.create({
            user_id: 'user-01',
            sportCourt_id: 'court-01',
            start_time: new Date(2025, 0, 13, 10, 0, 0),
            end_time: new Date(2025, 0, 13, 13, 0, 0),
            price: 60
        })

        await sut.execute({
            bookingId: createdBooking.id
        })
        
        await expect(() => 
            sut.execute({
                bookingId: createdBooking.id
            })
        ).rejects.toBeInstanceOf(InvalidBookingStatus)
    })
})