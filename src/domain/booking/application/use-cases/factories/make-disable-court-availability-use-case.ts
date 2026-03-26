import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { DisableSportCourtAvailabilityUseCase } from "../disable-court-availability.ts" 

export function makeDisableSportCourtAvailabilityUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()
    const disableSportCourtUseCase = new DisableSportCourtAvailabilityUseCase(sportCourtsRepository)

    return disableSportCourtUseCase
}