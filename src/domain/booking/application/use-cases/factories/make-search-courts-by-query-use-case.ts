import { PrismaSportCourtsRepository } from "@/infra/repositories/prisma/prisma-sport-court-repository.ts"
import { LocationIqGeocodingProvider } from "@/infra/geocoding/locationiq/locationiq-geocoding-provider.ts"
import { SearchCourtsByQueryUseCase } from "../search-courts-by-query.ts"


export function makeSearchCourtsByQueryUseCase() {
    const sportCourtsRepository = new PrismaSportCourtsRepository()
    const geocodingProvider = new LocationIqGeocodingProvider()

    const searchCourtsByQueryUseCase = new SearchCourtsByQueryUseCase(
        sportCourtsRepository,
        geocodingProvider
    )

    return searchCourtsByQueryUseCase
}