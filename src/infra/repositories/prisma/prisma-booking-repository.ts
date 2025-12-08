import type { Booking, Prisma } from "@prisma/client"
import type { BookingsRepository } from "@/domain/repositories/bookings-repository.ts";
import prisma from "@/infra/lib/prisma.ts";
import dayjs from "dayjs";


export class PrismaBookingsRepository implements BookingsRepository {
    async create(data: Prisma.BookingUncheckedCreateInput) {
        const booking = await prisma.booking.create({
            data
        })

        return booking
    }

    async findById(bookingId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        return booking
    }

    async findManyByUserId(userId: string, page: number) {
        const userBookings = await prisma.booking.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * 20, // pula os registros das páginas anteriores
            take: 20,
        })

        return userBookings
    }

    async findByUserIdOnDate(userId: string, date: Date) {
        const startOfDay = dayjs(date).startOf("day").toDate()
        const endOfDay = dayjs(date).endOf("day").toDate()

        const booking = await prisma.booking.findFirst({
            where: {
                user_id: userId,
                created_at: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['CONFIRMED', 'PENDING']
                }
            }
        })

        return booking
    }

    async findBySportCourtIdOnInterval(sportCourtId: string, startTime: Date, endTime: Date) {
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                sportCourt_id: sportCourtId,
                start_time: { lt: endTime },
                end_time: { gt: startTime },
                status: {
                    in: ['CONFIRMED', 'PENDING']
                }
            }
        })

        return conflictingBooking
    }
    
    async save(booking: Booking) {
        const updBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: booking
        })

        return updBooking
    }
}