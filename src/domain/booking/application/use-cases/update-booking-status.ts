import { BookingStatus, type Booking } from "@prisma/client"
import type { BookingsRepository } from "../../../repositories/bookings-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import { InvalidBookingStatus } from "./errors/invalid-booking-status-error.ts"

interface UpdateBookingStatusUseCaseRequest {
    bookingId: string,
    bookingStatus: BookingStatus
}

interface UpdateBookingStatusUseCaseResponse {
    booking: Booking
}

export class UpdateBookingStatusUseCase {
    constructor(private bookingRepository: BookingsRepository) { }

    async execute({
        bookingId,
        bookingStatus
    }: UpdateBookingStatusUseCaseRequest): Promise<UpdateBookingStatusUseCaseResponse> {
        const booking = await this.bookingRepository.findById(bookingId)

        if (!booking) {
            throw new ResourceNotFound()
        }

        if (booking.status === bookingStatus) {
            throw new InvalidBookingStatus()
        }

        booking.status = bookingStatus

        await this.bookingRepository.save(booking)

        return {
            booking,
        }
    }
}