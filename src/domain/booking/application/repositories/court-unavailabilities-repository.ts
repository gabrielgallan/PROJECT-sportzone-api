import type { Interval } from "@/core/types/interval";
import type { CourtUnavailability } from "../../enterprise/entities/court-unavailability";

export interface CourtUnavailabilitiesRepository {
	create(courtUnavailability: CourtUnavailability): Promise<void>;
	findManyByCourtId(courtId: string): Promise<CourtUnavailability[]>;
	findByCourtIdAndInterval(
		courtId: string,
		interval: Interval,
	): Promise<CourtUnavailability | null>;
}
