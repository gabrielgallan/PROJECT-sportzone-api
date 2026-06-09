import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { PrismaCourtBlockedDatesRepository } from "@/infra/repositories/prisma/prisma-court-blocked-dates-repository.ts"
import { RestrictCourtDateUseCase } from "../restrict-court-dates.ts"

export function makeRestrictCourtDateUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()
    const courtBlockedDatesRepository = new PrismaCourtBlockedDatesRepository()

    const restrictCourtDateUseCase = new RestrictCourtDateUseCase(
        sportCourtsRepository,
        courtBlockedDatesRepository
    )

    return restrictCourtDateUseCase
}