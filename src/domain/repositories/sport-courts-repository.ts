import type { SportCourt, Prisma } from "@prisma/client"
import type { Cordinate } from "@/utils/get-distance-between-cordinates.ts"

export interface SportCourtsRepository {
    create(data: Prisma.SportCourtUncheckedCreateInput): Promise<SportCourt>
    findById(id: string): Promise<SportCourt | null>
    searchManyByCordinates(cord: Cordinate, sportType: string | null, page: number): Promise<SportCourt[]>
    save(sportCourt: SportCourt): Promise<SportCourt>
}