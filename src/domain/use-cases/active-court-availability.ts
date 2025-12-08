import type { SportCourt } from "@prisma/client";
import type { SportCourtsRepository } from "../repositories/sport-courts-repository.ts";
import { ResourceNotFound } from "./errors/resource-not-found.ts";
import { UnauthorizedToModifySportCourts } from "./errors/unauthorized-to-modify-court.ts";

interface ActivateSportCourtAvailabilityUseCaseRequest {
    userId: string
    sportCourtId: string
}

interface ActivateSportCourtAvailabilityUseCaseResponse {
    sportCourt: SportCourt
}

export class ActivateSportCourtAvailabilityUseCase {
    constructor(private sportCourtsRepository: SportCourtsRepository) { }

    async execute({ userId, sportCourtId }: ActivateSportCourtAvailabilityUseCaseRequest): Promise<ActivateSportCourtAvailabilityUseCaseResponse> {
        const sportCourt = await this.sportCourtsRepository.findById(sportCourtId)

        if (!sportCourt) {
            throw new ResourceNotFound()
        }

        if (sportCourt.owner_id !== userId) {
            throw new UnauthorizedToModifySportCourts()
        }

        sportCourt.is_active = true

        await this.sportCourtsRepository.save(sportCourt)

        return {
            sportCourt,
        }
    }
}