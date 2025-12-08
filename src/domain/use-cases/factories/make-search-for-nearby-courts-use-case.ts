import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { SearchForNearbyCourtsUseCase } from "../search-for-nearby-courts.ts"


export function makeSearchForNearbyCourtsUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()

    const searchForNearbyCourtsUseCase = new SearchForNearbyCourtsUseCase(
        sportCourtsRepository,
    )

    return searchForNearbyCourtsUseCase
}