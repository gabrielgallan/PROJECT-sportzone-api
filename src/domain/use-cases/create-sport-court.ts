import type { Prisma, SportCourt } from "@prisma/client";
import type { SportCourtsRepository } from "../repositories/sport-courts-repository.ts";

interface CreateSportCourtUseCaseRequest {
    owner_id: string
    title: string
    type: string
    phone: string | null
    location: string
    latitude: number
    longitude: number
    price_per_hour: number
}

interface CreateSportCourtUseCaseResponse {
    sportCourt: SportCourt
}

export class CreateSportCourtUseCase {
    constructor(private sportCourtsRepository: SportCourtsRepository) {}

    async execute(data: CreateSportCourtUseCaseRequest): Promise<CreateSportCourtUseCaseResponse> {
        const sportCourt = await this.sportCourtsRepository.create(data)

        return { sportCourt }
    }
}