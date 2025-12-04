import { Prisma, type SportCourt } from "@prisma/client"
import type { SportCourtsRepository } from "@/domain/repositories/sport-courts-repository.ts"
import { randomUUID } from "crypto"
import { getDistanceBetweenCordinates, type Cordinate } from "@/utils/get-distance-between-cordinates.ts"

export class InMemorySportCourtsRepository implements SportCourtsRepository {
    private items: SportCourt[] = []
    
    async searchManyByCordinates (
        cord: Cordinate, 
        sportType: string | null, 
        page: number
    ) {
        const sportCourts = sportType ? 
            this.items.filter(c => {
                return (c.type === sportType) && (c.is_active)
            }) : 
            this.items.filter(c => c.is_active)

        const nearbySportCourts = sportCourts.filter(court => {
            const distance = getDistanceBetweenCordinates(
                { latitude: cord.latitude, longitude: cord.longitude },
                { latitude: court.latitude.toNumber(), longitude: court.longitude.toNumber() }
            )
            
            return distance < 10
        }).slice((page - 1) * 20, page * 20)
        
        return nearbySportCourts
    }
    
    async searchAll() {
        return this.items
    }
    
    async create(data: Prisma.SportCourtUncheckedCreateInput) {
        const sportCourt = {
            id: data.id ?? randomUUID(),
            owner_id: data.owner_id ?? randomUUID(),
            title: data.title,
            type: data.type,
            is_active: data.is_active ?? true,
            phone: data.phone ?? '',
            location: data.location,
            latitude: new Prisma.Decimal(data.latitude.toString()),
            longitude: new Prisma.Decimal(data.longitude.toString()),
            price_per_hour: new Prisma.Decimal(data.price_per_hour.toString())
        }
        
        this.items.push(sportCourt)
        
        return sportCourt
    }
    
    async findById(id: string) {
        const sportCourt = this.items.find(court => court.id === id)
        
        if (!sportCourt) return null
        
        return sportCourt
    }

    async save(sportCourt: SportCourt) {
        const courtIndex = this.items.findIndex(c => c.id === sportCourt.id)

        if (courtIndex >= 0) {
            this.items[courtIndex] = sportCourt
        }

        return sportCourt
    }
}