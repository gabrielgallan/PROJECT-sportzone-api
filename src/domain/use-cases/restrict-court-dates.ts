import type { CourtBlockedDate } from "@prisma/client"
import type { SportCourtsRepository } from "../repositories/sport-courts-repository.ts"
import { ResourceNotFound } from "./errors/resource-not-found.ts"
import type { CourtBlockedDatesRepository } from "../repositories/court-blocked-dates-repository.ts"
import dayjs from "dayjs"
import { IncorrectTimestampInterval } from "./errors/incorrect-timestamp-interval.ts"
import { UnauthorizedToModifySportCourts } from "./errors/unauthorized-to-modify-court.ts"

interface RestrictCourtDateUseCaseRequest {
    userId: string,
    sportCourtId: string,
    startDate: Date,
    endDate: Date,
    reason: string | null
}

interface RestrictCourtDateUseCaseResponse {
    courtBlockedDate: CourtBlockedDate
}

export class RestrictCourtDateUseCase {
    constructor(
        private sportCourtsRepository: SportCourtsRepository,
        private courtBlockedDatesRepository: CourtBlockedDatesRepository
    ) { }

    async execute({ userId, sportCourtId, startDate, endDate, reason }: RestrictCourtDateUseCaseRequest): Promise<RestrictCourtDateUseCaseResponse> {
        const sportCourt = await this.sportCourtsRepository.findById(sportCourtId)
        const startDateJs = dayjs(startDate)
        const endDateJs = dayjs(endDate)

        if (!sportCourt) {
            throw new ResourceNotFound()
        }

        if (sportCourt.owner_id !== userId) {
            throw new UnauthorizedToModifySportCourts()
        }

        const dateIsChronologicallyCorrect = startDateJs.isBefore(endDateJs)

        if (!dateIsChronologicallyCorrect) {
            throw new IncorrectTimestampInterval()
        }

        const courtBlockedDate = await this.courtBlockedDatesRepository.create({
            sportCourt_id: sportCourtId,
            start_time: startDate,
            end_time: endDate,
            reason
        })

        return {
            courtBlockedDate,
        }
    }
}