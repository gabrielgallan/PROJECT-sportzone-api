import { Either, right } from "@/core/types/either"
import { Court } from "../../enterprise/entities/court"
import { CourtsRepository } from "../repositories/courts-repository"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Cash } from "../../enterprise/entities/value-objects/cash"

interface CreateSportCourtUseCaseRequest {
    userId: string
    title: string
    type: string
    phone?: string
    location: string
    latitude: number
    longitude: number
    pricePerHour: number
}

type CreateSportCourtUseCaseResponse = Either<
    null,
    {
        court: Court
    }
>

export class CreateSportCourtUseCase {
    constructor(private courtsRepository: CourtsRepository) { }

    async execute({
        userId,
        title,
        type,
        phone,
        location,
        latitude,
        longitude,
        pricePerHour,
    }: CreateSportCourtUseCaseRequest): Promise<CreateSportCourtUseCaseResponse> {
        const court = Court.create({
            ownerId: new UniqueEntityID(userId),
            title,
            type,
            phone,
            location,
            latitude,
            longitude,
            pricePerHour: Cash.fromAmount(pricePerHour),
        })

        return right({
            court
        })
    }
}