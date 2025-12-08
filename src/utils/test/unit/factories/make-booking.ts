import type { SportCourt, User } from "@prisma/client";
import type { BookingsRepository } from "@/domain/repositories/bookings-repository.ts";

export async function makeBooking (
    repository: BookingsRepository,
    user?: User, 
    sportCourt?: SportCourt,
) {
    const booking = repository.create({
            user_id: user?.id ?? 'user-01',
            sportCourt_id: sportCourt?.id ?? 'court-01',
            start_time: new Date(2025, 0, 13, 12, 0, 0),
            end_time: new Date(2025, 0, 13, 16, 0, 0),
            price: sportCourt ? Number(sportCourt.price_per_hour) * 4 : 80  
        })

    return booking
}