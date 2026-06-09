import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository.ts"
import { UpdateBookingStatusUseCase } from "../update-booking-status.ts"

export function makeUpdateBookingStatusUseCase() {
    const bookingsRepositpry = new PrismaBookingsRepository()

    const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(
        bookingsRepositpry,
    )

    return updateBookingStatusUseCase
}