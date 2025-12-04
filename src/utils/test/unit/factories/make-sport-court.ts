import type { User } from "@prisma/client";
import type { SportCourtsRepository } from "@/domain/repositories/sport-courts-repository";

export async function makeSportCourt(
    repository: SportCourtsRepository,
    user?: User,
) {
    const sportCourt = repository.create({
            owner_id: user?.id ?? 'user-01',
            title: 'Volei SportCourt',
            type: 'Volei',
            location: 'Shopping Jardim Sul Quadra',
            phone: '1234-5678',
            latitude: -23.630180,
            longitude: -46.735809,
            price_per_hour: 20
        })

    return sportCourt
}