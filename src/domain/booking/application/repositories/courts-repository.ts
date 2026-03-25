import type { Cordinate } from "@/utils/get-distance-between-cordinates.ts"
import { Court } from "../../enterprise/entities/court"
import { Pagination } from "@/core/types/pagination"

interface CourtSearchQuery {
    cordinate: Cordinate
    sportType?: string
    pagination: Pagination
}

export interface CourtsRepository {
    create(court: Court): Promise<void>
    findById(id: string): Promise<Court | null>
    searchManyByQuery(query: CourtSearchQuery): Promise<Court[]>
    save(court: Court): Promise<void>
}