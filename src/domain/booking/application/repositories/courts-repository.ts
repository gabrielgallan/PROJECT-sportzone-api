import type { Pagination } from "@/core/types/pagination";
import type { Court } from "../../enterprise/entities/court";
import type { Cordinate } from "../geocoding/cordinate";

export interface CourtSearchQuery {
	cordinate: Cordinate;
	sportType?: string;
	pagination: Pagination;
}

export interface CourtsRepository {
	create(court: Court): Promise<void>;
	findById(id: string): Promise<Court | null>;
	searchManyByCordinates(query: CourtSearchQuery): Promise<Court[]>;
	save(court: Court): Promise<void>;
}
