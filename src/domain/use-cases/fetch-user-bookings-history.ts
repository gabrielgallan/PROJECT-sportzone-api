import type { Booking } from "@prisma/client"
import { ResourceNotFound } from "./errors/resource-not-found.ts";
import type { BookingsRepository } from "../repositories/bookings-repository.ts";
import type { UsersRepository } from "../repositories/users-repository.ts";

interface FetchUserBookingsHistoryUseCaseRequest {
    userId: string,
    page: number
}

interface FetchUserBookingsHistoryUseCaseResponse {
    bookings: Booking[]
}

export class FetchUserBookingsHistoryUseCase {
    constructor(
        private bookingsRepository: BookingsRepository,
        private usersRepository: UsersRepository
    ) {}
    
    async execute({ userId, page }: FetchUserBookingsHistoryUseCaseRequest): Promise<FetchUserBookingsHistoryUseCaseResponse> {
        const userExists = await this.usersRepository.findByUserId(userId)

        if (!userExists) {
            throw new ResourceNotFound()
        }
        
        const bookings = await this.bookingsRepository.findManyByUserId(
            userId,
            page
        )

        return {
            bookings,
        }
    }
}