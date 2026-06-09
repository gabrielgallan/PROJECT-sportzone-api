import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { ActivateSportCourtAvailabilityUseCase } from "../active-court-availability.ts"

export function makeActivateSportCourtAvailabilityUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()
    const activateSportCourtUseCase = new ActivateSportCourtAvailabilityUseCase(sportCourtsRepository)

    return activateSportCourtUseCase
}