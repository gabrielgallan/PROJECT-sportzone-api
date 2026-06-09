import { getDistanceBetweenCordinates } from "@/domain/booking/application/geocoding/get-distance-between-cordinates"
import type { CourtSearchQuery, CourtsRepository } from "@/domain/booking/application/repositories/courts-repository"
import type { Court } from "@/domain/booking/enterprise/entities/court"

export class InMemoryCourtsRepository implements CourtsRepository {
    public items: Court[] = []

    async create(court: Court) {
        this.items.push(court)

    }

    async findById(id: string) {
        const court = this.items.find(c => c.id.toString() === id)

        return court ?? null
    }

    async searchManyByCordinates({ cordinate, sportType, pagination }: CourtSearchQuery) {
        const { page, limit } = pagination

        const nearbyCourts = this.items.filter(
            (court) => {
                const distanceInKilometers = getDistanceBetweenCordinates({
                    from: { latitude: cordinate.latitude, longitude: cordinate.longitude },
                    to: { latitude: court.latitude, longitude: court.longitude }
                })

                if (sportType) {
                    return distanceInKilometers < 10 && court.type === sportType
                }

                return distanceInKilometers < 10
            }
        )

        const paginated = nearbyCourts.slice((page - 1) * limit, page * limit)

        return paginated
    }

    async save(court: Court) {
        const courtIndex = this.items.findIndex(c => c.id.toString() === court.id.toString())

        if (courtIndex >= 0) {
            this.items[courtIndex] = court
        }

        return
    }
}