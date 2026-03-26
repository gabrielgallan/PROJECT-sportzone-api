import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository.ts"
import { ConfirmBookingUseCase } from "../confirm-booking.ts"

export function makeConfirmBookingUseCase() {
    const bookingsRepository = new PrismaBookingsRepository()
    const confirmBookingUseCase = new ConfirmBookingUseCase(bookingsRepository)

    return confirmBookingUseCase
}