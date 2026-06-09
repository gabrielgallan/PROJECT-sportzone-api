import { Either, right } from "@/core/types/either.ts";
import type { Court } from "../../enterprise/entities/court.ts"
import { CourtsRepository } from "../repositories/courts-repository.ts"

interface SearchForNearbyCourtsUseCaseRequest {
    userLatitude: number,
    userLongitude: number,
    page?: number
    limit?: number
}

type SearchForNearbyCourtsUseCaseResponse = Either<
    null,
    { courts: Court[] }
>

export class SearchForNearbyCourtsUseCase {
    constructor(private courtsRepository: CourtsRepository) { }

    async execute({
        userLatitude,
        userLongitude,
        page = 1,
        limit = 10
    }: SearchForNearbyCourtsUseCaseRequest): Promise<SearchForNearbyCourtsUseCaseResponse> {
        const courts = await this.courtsRepository.searchManyByCordinates({
            cordinate: {
                longitude: userLongitude,
                latitude: userLatitude
            },
            pagination: {
                page, limit
            }
        })

        return right({
            courts
        })
    }
}