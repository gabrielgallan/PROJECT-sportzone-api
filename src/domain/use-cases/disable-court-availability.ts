import type { SportCourt } from "@prisma/client";
import type { SportCourtsRepository } from "../repositories/sport-courts-repository.ts";
import { ResourceNotFound } from "./errors/resource-not-found.ts";
import { SportCourtAlreadyDisabled } from "./errors/sport-court-already-disabled.ts";
import { UnauthorizedToModifySportCourts } from "./errors/unauthorized-to-modify-court.ts";

interface DisableSportCourtAvailabilityUseCaseRequest {
    userId: string
    sportCourtId: string
}

interface DisableSportCourtAvailabilityUseCaseResponse {
    sportCourt: SportCourt
}

export class DisableSportCourtAvailabilityUseCase {
    constructor(private sportCourtsRepository: SportCourtsRepository) {}

    async execute({ userId, sportCourtId }: DisableSportCourtAvailabilityUseCaseRequest): Promise<DisableSportCourtAvailabilityUseCaseResponse> {
        const sportCourt = await this.sportCourtsRepository.findById(sportCourtId)

        if (!sportCourt) {
            throw new ResourceNotFound()
        }

        if (sportCourt.owner_id !== userId) {
            throw new UnauthorizedToModifySportCourts()
        }

        if (sportCourt.is_active === false) {
            throw new SportCourtAlreadyDisabled()
        }

        sportCourt.is_active = false

        await this.sportCourtsRepository.save(sportCourt)

        return { 
            sportCourt,
        }
    }
}