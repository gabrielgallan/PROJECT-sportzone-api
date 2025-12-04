import { Prisma } from "@prisma/client"
import type { CourtBlockedDatesRepository } from "@/domain/repositories/court-blocked-dates-repository.ts"
import prisma from "@/infra/lib/prisma.ts"


export class PrismaCourtBlockedDatesRepository implements CourtBlockedDatesRepository {
    async create(data: Prisma.CourtBlockedDateUncheckedCreateInput) {
        const courtBlockedDate = await prisma.courtBlockedDate.create({
            data
        })
        
        return courtBlockedDate
    }
    
    async findByTimeInterval(sportCourtId: string, startDate: Date, endDate: Date) {
        const blockedDate = await prisma.courtBlockedDate.findFirst({
            where: {
                sportCourt_id: sportCourtId,
                start_time: { lt: endDate },
                end_time: { gt: startDate }
            }
        })

        return blockedDate
    }

    async findManyBySportCourtId(sportCourtId: string) {
        const blockedDates = await prisma.courtBlockedDate.findMany({
            where: { 
                sportCourt_id: sportCourtId
            }
        })

        return blockedDates
    }
}