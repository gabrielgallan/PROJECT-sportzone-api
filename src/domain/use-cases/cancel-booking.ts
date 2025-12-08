import { BookingStatus, type Booking } from "@prisma/client"
import type { BookingsRepository } from "../repositories/bookings-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import { InvalidBookingStatus } from "./errors/invalid-booking-status-error.ts"
import dayjs from "dayjs"
import { LateBookingCancellation } from "./errors/late-booking-cancellation.ts"
import { UnauthorizedToModifyBooking } from "./errors/unauthorized-to-modify-booking.ts"

interface CancelBookingUseCaseRequest {
    userId: string,
    bookingId: string
}

interface CancelBookingUseCaseResponse {
    booking: Booking
}

export class CancelBookingUseCase {
    constructor(
        private bookingRepository: BookingsRepository
    ) { }

    async execute({
        userId,
        bookingId
    }: CancelBookingUseCaseRequest): Promise<CancelBookingUseCaseResponse> {
        const booking = await this.bookingRepository.findById(bookingId)

        if (!booking) {
            throw new ResourceNotFound()
        }

        if (booking.user_id !== userId) {
            throw new UnauthorizedToModifyBooking()
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new InvalidBookingStatus()
        }

        const distanceInMinutesFromBookingStartTime = dayjs(booking.start_time).diff(
            new Date(),
            'minutes'
        )

        if (distanceInMinutesFromBookingStartTime < 120) {
            throw new LateBookingCancellation()
        }

        booking.status = BookingStatus.CANCELLED

        await this.bookingRepository.save(booking)

        return {
            booking,
        }
    }
}