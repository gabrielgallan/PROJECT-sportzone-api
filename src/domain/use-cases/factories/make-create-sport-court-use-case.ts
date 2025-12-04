import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { CreateSportCourtUseCase } from "../create-sport-court.ts"

export function makeCreateSportCourtUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()
    const createSportCourtUseCase = new CreateSportCourtUseCase(sportCourtsRepository)

    return createSportCourtUseCase
}