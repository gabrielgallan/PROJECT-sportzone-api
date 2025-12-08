import { Prisma, type CourtBlockedDate } from "@prisma/client"
import type { CourtBlockedDatesRepository } from "@/domain/repositories/court-blocked-dates-repository.ts"
import { randomUUID } from "crypto"


export class InMemoryCourtBlockedDatesRepository implements CourtBlockedDatesRepository {
    private items: CourtBlockedDate[] = []

    
    async create(data: Prisma.CourtBlockedDateUncheckedCreateInput) {
        const courtBlockedDate = {
            id: data.id ?? randomUUID(),
            sportCourt_id: data.sportCourt_id,
            start_time: new Date(data.start_time),
            end_time: new Date(data.end_time),
            reason: data.reason ?? ''
        }
        
        this.items.push(courtBlockedDate)
        
        return courtBlockedDate
    }
    
    async findManyBySportCourtId(sportCourtId: string) {
        const blockedDates = this.items.filter(date => date.sportCourt_id === sportCourtId)
        
        return blockedDates
    }
    
    async findByTimeInterval(sportCourtId: string, startDate: Date, endDate: Date){
        const blockedTime = this.items.find(b =>
            b.sportCourt_id === sportCourtId &&
            b.start_time < endDate &&
            b.end_time > startDate
        )

        if (!blockedTime) return null

        return blockedTime
    }
}