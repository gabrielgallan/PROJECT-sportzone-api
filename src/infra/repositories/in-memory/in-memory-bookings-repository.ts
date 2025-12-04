import { type Prisma, type Booking, BookingStatus } from "@prisma/client"
import type { BookingsRepository } from "@/domain/repositories/bookings-repository.ts"
import { randomUUID } from "crypto"
import dayjs from "dayjs"
import { Decimal } from "@prisma/client/runtime/library"


export class InMemoryBookingsRepository implements BookingsRepository {
    private items: Booking[] = []

    async create(data: Prisma.BookingUncheckedCreateInput): Promise<Booking> {
        const booking = {
            id: data.id ?? randomUUID(),
            start_time: new Date(data.start_time),
            end_time: new Date(data.end_time),
            sportCourt_id: data.sportCourt_id,
            user_id: data.user_id,
            price: new Decimal(data.price.toString()),
            status: data.status ?? BookingStatus.PENDING,
            created_at: new Date()
        }

        this.items.push(booking)

        return booking
    }

    async save(booking: Booking) {
        const bookingIndex = this.items.findIndex(b => b.id === booking.id)

        if (bookingIndex >= 0) {
            this.items[bookingIndex] = booking
        }

        return booking
    }

    async findById(bookingId: string) {
        const booking = this.items.find(b => b.id === bookingId)

        if (!booking) return null

        return booking
    }

    async findManyByUserId(userId: string, page: number) {
        const userBookings = this.items
            .filter(b => b.user_id === userId)
            .slice((page - 1) * 20, page * 20)

        return userBookings
    }

    async findBySportCourtIdOnInterval(sporCourt_id: string, startDate: Date, endDate: Date) {
        const confirmedBookings = this.items.filter(b => {
            return ['CONFIRMED', 'PENDING'].includes(b.status)
        })

        const bookingInTheSameInterval = confirmedBookings.find(b =>
            b.sportCourt_id === sporCourt_id &&
            b.start_time < endDate &&
            b.end_time > startDate
        )

        if (!bookingInTheSameInterval) return null

        return bookingInTheSameInterval
    }

    async findByUserIdOnDate(userId: string, date: Date) {
        const startOfTheDay = dayjs(date).startOf('date')
        const endOfTheDay = dayjs(date).endOf('date')

        const bookingOnSameDate = this.items.find((booking) => {
            if (!['CONFIRMED', 'PENDING'].includes(booking.status)) return false

            const bookingInDate = dayjs(booking.created_at)
            const isOnSameDate =
                bookingInDate.isAfter(startOfTheDay) && bookingInDate.isBefore(endOfTheDay)

            return booking.user_id === userId && isOnSameDate
        })

        if (!bookingOnSameDate) return null

        return bookingOnSameDate
    }

}