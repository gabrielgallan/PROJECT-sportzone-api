import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository.ts"
import { CancelBookingUseCase } from "../cancel-booking.ts"

export function makeCancelBookingUseCase() {
    const bookingsRepository = new PrismaBookingsRepository()
    const cancelBookingUseCase = new CancelBookingUseCase(bookingsRepository)

    return cancelBookingUseCase
}