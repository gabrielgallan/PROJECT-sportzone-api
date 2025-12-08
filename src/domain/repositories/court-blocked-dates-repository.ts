import type { CourtBlockedDate, Prisma } from "@prisma/client"

export interface CourtBlockedDatesRepository {
    create(data: Prisma.CourtBlockedDateUncheckedCreateInput): Promise<CourtBlockedDate>
    findManyBySportCourtId(sportCourtId: string): Promise<CourtBlockedDate[]>
    findByTimeInterval(sportCourtId: string, startDate: Date, endDate: Date): Promise<CourtBlockedDate | null>
}