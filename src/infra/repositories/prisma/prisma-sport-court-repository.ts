import type { Prisma, SportCourt } from "@prisma/client"
import prisma from "@/infra/lib/prisma.ts"
import type { SportCourtsRepository } from "@/domain/repositories/sport-courts-repository.ts"
import { getDistanceBetweenCordinates, type Cordinate } from "@/utils/get-distance-between-cordinates.ts"


export class PrismaSportCourtsRepository implements SportCourtsRepository {
    async save(sportCourt: SportCourt) {
        const updSportCourt = await prisma.sportCourt.update({
            where: { id: sportCourt.id },
            data: sportCourt
        })

        return updSportCourt
    }

    async create(data: Prisma.SportCourtUncheckedCreateInput): Promise<SportCourt> {
        const sportCourt = await prisma.sportCourt.create({
            data
        })

        return sportCourt
    }

    async findById(id: string) {
        const sportCourt = await prisma.sportCourt.findUnique({
            where: { id }
        })

        return sportCourt
    }

    async searchManyByCordinates (
        cord: Cordinate, 
        sportType: string | null, 
        page: number
    ) {
        const sportCourts = sportType ? 
            await prisma.sportCourt.findMany({ where: { type: sportType, is_active: true } }) : 
            await prisma.sportCourt.findMany({ where: { is_active: true } })

        const nearbySportCourts = sportCourts.filter(court => {
            const distance = getDistanceBetweenCordinates (
                { latitude: cord.latitude, longitude: cord.longitude },
                { latitude: court.latitude.toNumber(), longitude: court.longitude.toNumber() }
            )

            return distance < 10
        }).slice((page - 1) * 20, page * 20)

        return nearbySportCourts
    }
}