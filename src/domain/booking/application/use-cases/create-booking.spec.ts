import { it, describe, expect, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryBookingsRepository } from '@/infra/repositories/in-memory/in-memory-bookings-repository.ts'
import type { BookingsRepository } from '@/domain/repositories/bookings-repository.ts'
import { CreateBookingUseCase } from './create-booking.ts'
import { randomUUID } from 'crypto'
import type { SportCourtsRepository } from '../../../repositories/sport-courts-repository.ts'
import { InMemorySportCourtsRepository } from '@/infra/repositories/in-memory/in-memory-sport-courts-repository.ts'
import { SportCourtDateAlreadyOccupied } from './errors/sport-courts-date-already-occupied.ts'
import { MaxBookingsPerDayError } from './errors/max-bookings-per-day-error.ts'
import { InvalidTimestampBookingInterval } from './errors/invalid-timestamp-booking-interval.ts'
import type { CourtBlockedDatesRepository } from '../../../repositories/court-blocked-dates-repository.ts'
import { InMemoryCourtBlockedDatesRepository } from '@/infra/repositories/in-memory/in-memory-court-blocked-dates-repository.ts'
import { SportCourtUnavailable } from './errors/sport-court-unavailable.ts'
import { SportCourtDateBlocked } from './errors/sport-court-date-blocked.ts'

let bookingRepository: BookingsRepository
let sportCourtsRepository: SportCourtsRepository
let courtBlockedDatesRepository: CourtBlockedDatesRepository
let sut: CreateBookingUseCase

describe('Create Booking Use Case', () => {
    beforeEach(() => {
        bookingRepository = new InMemoryBookingsRepository()
        sportCourtsRepository = new InMemorySportCourtsRepository()
        courtBlockedDatesRepository = new InMemoryCourtBlockedDatesRepository()

        sut = new CreateBookingUseCase(
            bookingRepository,
            sportCourtsRepository,
            courtBlockedDatesRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to create a new booking', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        const { booking } = await sut.execute({
            userId: randomUUID(),
            sportCourtId: sportCourt.id,
            startTime: new Date(2025, 0, 13, 10, 0, 0),
            endTime: new Date(2025, 0, 13, 13, 0, 0),
        })

        expect(booking.id).toEqual(expect.any(String))
    })

    it("should not be able to create a booking if court its unavaliable", async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await sportCourtsRepository.save({
            ...sportCourt,
            is_active: false
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 13, 13, 0, 0),
                endTime: new Date(2025, 0, 13, 16, 0, 0),
            })
        ).rejects.toBeInstanceOf(SportCourtUnavailable)
    })

    it("should not be able to create a booking on date restrict", async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await courtBlockedDatesRepository.create({
            sportCourt_id: sportCourt.id,
            start_time: new Date(2025, 0, 13, 10, 0),
            end_time: new Date(2025, 0, 13, 15, 0)
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 13, 13, 0, 0),
                endTime: new Date(2025, 0, 13, 16, 0, 0),
            })
        ).rejects.toBeInstanceOf(SportCourtDateBlocked)
    })

    it('should not be able to create a booking on data its already occupied.', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        const booking1 = await sut.execute({
            userId: randomUUID(),
            sportCourtId: sportCourt.id,
            startTime: new Date(2025, 0, 16, 10, 0, 0),
            endTime: new Date(2025, 0, 16, 14, 0, 0),
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 16, 13, 0, 0),
                endTime: new Date(2025, 0, 16, 16, 0, 0),
            })
        ).rejects.toBeInstanceOf(SportCourtDateAlreadyOccupied)
    })

    it('should not be able to create a booking with time interval chronologically incorrect.', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 14, 14, 0, 0),
                endTime: new Date(2025, 0, 13, 16, 0, 0),
            })
        ).rejects.toBeInstanceOf(InvalidTimestampBookingInterval)
    })

    it('should not be able to create two booking in the same day.', async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        const { booking } = await sut.execute({
            userId: randomUUID(),
            sportCourtId: sportCourt.id,
            startTime: new Date(2025, 0, 13, 10, 0, 0),
            endTime: new Date(2025, 0, 13, 14, 0, 0),
        })

        await expect(() =>
            sut.execute({
                userId: booking.user_id,
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 13, 14, 0, 0),
                endTime: new Date(2025, 0, 13, 16, 0, 0),
            })
        ).rejects.toBeInstanceOf(MaxBookingsPerDayError)
    })

    it("should not be able to create a booking with less than 2 hours notice.", async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 13, 8, 0, 0),
                endTime: new Date(2025, 0, 13, 12, 0, 0),
            })
        ).rejects.toBeInstanceOf(InvalidTimestampBookingInterval)
    })

    it("should not be able to create a booking with more than 6 hours of interval.", async () => {
        vi.setSystemTime(new Date(2025, 0, 13, 7, 0, 0))

        const sportCourt = await sportCourtsRepository.create({
            owner_id: 'owner-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

        await expect(() =>
            sut.execute({
                userId: randomUUID(),
                sportCourtId: sportCourt.id,
                startTime: new Date(2025, 0, 13, 10, 0, 0),
                endTime: new Date(2025, 0, 13, 18, 0, 0),
            })
        ).rejects.toBeInstanceOf(InvalidTimestampBookingInterval)
    })
})