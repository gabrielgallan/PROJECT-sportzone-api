import type { Cordinate } from "@/domain/booking/application/geocoding/get-distance-between-cordinates";
import type { Prisma, SportCourt } from "@prisma/client";

export interface SportCourtsRepository {
	create(data: Prisma.SportCourtUncheckedCreateInput): Promise<SportCourt>;
	findById(id: string): Promise<SportCourt | null>;
	searchManyByCordinates(
		cord: Cordinate,
		sportType: string | null,
		page: number,
	): Promise<SportCourt[]>;
	save(sportCourt: SportCourt): Promise<SportCourt>;
}
