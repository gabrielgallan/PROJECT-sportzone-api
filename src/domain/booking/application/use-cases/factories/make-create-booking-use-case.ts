import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository.ts"
import { CreateBookingUseCase } from "../create-booking.ts"
import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { PrismaCourtBlockedDatesRepository } from "@/infra/repositories/prisma/prisma-court-blocked-dates-repository.ts"

export function makeCreateBookingUseCase() {
    const bookingsRepository = new PrismaBookingsRepository()
    const sportCourtRepository = new PrismaSportCourtsRepository()
    const courtBlockedDatesRepository = new PrismaCourtBlockedDatesRepository()

    const createBookingUseCase = new CreateBookingUseCase(
        bookingsRepository,
        sportCourtRepository,
        courtBlockedDatesRepository
    )

    return createBookingUseCase
}