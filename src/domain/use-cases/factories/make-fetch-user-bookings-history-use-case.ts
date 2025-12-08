import { PrismaUsersRepository } from "@/infra/repositories/prisma/prisma-users-repository.ts"
import { PrismaBookingsRepository } from "@/infra/repositories/prisma/prisma-booking-repository.ts"
import { FetchUserBookingsHistoryUseCase } from "../fetch-user-bookings-history.ts"

export function makeFetchUserBookingsHistoryUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const bookingsRepository = new PrismaBookingsRepository()
    
    const fetchUserBookingsHistoryUseCase = new FetchUserBookingsHistoryUseCase(
        bookingsRepository,
        usersRepository,
    )

    return fetchUserBookingsHistoryUseCase
}