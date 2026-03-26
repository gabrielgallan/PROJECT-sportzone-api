import type { Booking } from "@prisma/client"
import type { BookingsRepository } from "../../../repositories/bookings-repository.ts"
import type { SportCourtsRepository } from "../../../repositories/sport-courts-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import { MaxBookingsPerDayError } from "./errors/max-bookings-per-day-error.ts"
import { SportCourtDateAlreadyOccupied } from "./errors/sport-courts-date-already-occupied.ts"
import dayjs from "dayjs"
import { InvalidTimestampBookingInterval } from "./errors/invalid-timestamp-booking-interval.ts"
import type { CourtBlockedDatesRepository } from "../../../repositories/court-blocked-dates-repository.ts"
import { CalculateBookingPrice } from "../../../../utils/calculate-booking-value.ts"
import { SportCourtDateBlocked } from "./errors/sport-court-date-blocked.ts"
import { SportCourtUnavailable } from "./errors/sport-court-unavailable.ts"

interface CreateBookingUseCaseRequest {
    userId: string,
    sportCourtId: string,
    startTime: Date,
    endTime: Date
}

interface CreateBookingUseCaseResponse {
    booking: Booking
}

export class CreateBookingUseCase {
    constructor(
        private bookingRepository: BookingsRepository,
        private sportCourtRepository: SportCourtsRepository,
        private courtBlockedDatesRepository: CourtBlockedDatesRepository
    ) { }

    async execute({ userId, sportCourtId, startTime, endTime }: CreateBookingUseCaseRequest): Promise<CreateBookingUseCaseResponse> {
        const startTimeJs = dayjs(startTime)
        const endTimeJs = dayjs(endTime)

        // Checking if SportCourt exists
        const sportCourt = await this.sportCourtRepository.findById(sportCourtId)

        if (!sportCourt) {
            throw new ResourceNotFound()
        }

        // Checking if Sport Court its avaliable to use
        if (!sportCourt.is_active) {
            throw new SportCourtUnavailable()
        }

        // Checking if court it's blocked on date
        const courtItsBlockedOnDate = await this.courtBlockedDatesRepository.findByTimeInterval(
            sportCourtId,
            startTime,
            endTime
        )

        if (courtItsBlockedOnDate) {
            throw new SportCourtDateBlocked(courtItsBlockedOnDate.reason)
        }

        // Checking if court it's already occupied
        const courtItsAlreadyOccupied = await this.bookingRepository.findBySportCourtIdOnInterval(
            sportCourtId,
            startTime,
            endTime
        )

        if (courtItsAlreadyOccupied) {
            throw new SportCourtDateAlreadyOccupied()
        }


        //Checking if time interval is chronologically correct
        const dateIsChronologicallyCorrect = startTimeJs.isBefore(endTimeJs)

        if (!dateIsChronologicallyCorrect) {
            throw new InvalidTimestampBookingInterval()
        }

        //Checking if has a 2 hours difference
        const isATwoHoursDifference = startTimeJs.isAfter(dayjs().add(2, 'hour'))

        if (!isATwoHoursDifference) {
            throw new InvalidTimestampBookingInterval()
        }

        //Checking if interval has a limit of 6 hours
        const differenceBetweenDates = endTimeJs.diff(startTimeJs, 'hour', true)

        if (!(differenceBetweenDates <= 6)) {
            throw new InvalidTimestampBookingInterval()
        }

        // Checking if user has already create a booking today
        const userHasAlreadyBookingToday = await this.bookingRepository.findByUserIdOnDate(
            userId,
            new Date()
        )

        if (userHasAlreadyBookingToday) {
            throw new MaxBookingsPerDayError()
        }



        const courtPerHourPrice = sportCourt.price_per_hour.toNumber()

        const totalPrice = CalculateBookingPrice(
            startTime,
            endTime,
            courtPerHourPrice
        )

        const newBooking = await this.bookingRepository.create({
            user_id: userId,
            sportCourt_id: sportCourtId,
            start_time: startTime,
            end_time: endTime,
            price: totalPrice
        })

        return {
            booking: newBooking
        }
    }
}