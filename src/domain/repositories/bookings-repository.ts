import type { Booking, Prisma } from "@prisma/client"

export interface BookingsRepository {
    create(data: Prisma.BookingUncheckedCreateInput): Promise<Booking>
    findByUserIdOnDate(userId: string, date:  Date): Promise<Booking | null>
    findBySportCourtIdOnInterval(sporCourt_id: string, startDate: Date, endDate: Date): Promise<Booking | null>
    findManyByUserId(userId: string, page: number): Promise<Booking[]>
    findById(bookingId: string): Promise<Booking | null>
    save(booking: Booking): Promise<Booking>
}