import { it, describe, expect, beforeEach } from 'vitest'
import { UpdateBookingStatusUseCase } from './update-booking-status.ts'
import type { BookingsRepository } from '../../../repositories/bookings-repository.ts'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'
import { makeBooking } from '@/utils/test/unit/factories/make-booking.ts'


let sut: UpdateBookingStatusUseCase
let bookingsRepository: BookingsRepository

describe('Validate payment register Use Case', () => {
    beforeEach(() => {
        bookingsRepository = new InMemoryBookingsRepository()

        sut = new UpdateBookingStatusUseCase(
            bookingsRepository,
        )
    })

    it('should be able to update bokking status', async () => {
        const newStatus = 'ERROR'
        const createdBooking = await makeBooking(bookingsRepository)

        const { booking } = await sut.execute({
            bookingId: createdBooking.id,
            bookingStatus: newStatus
        })

        expect(booking.status).toBe(newStatus)
    })
})