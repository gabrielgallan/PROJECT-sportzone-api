import type { Booking } from "../../enterprise/entities/booking";

export interface BookingsRepository {
	create(booking: Booking): Promise<void>;
	findByOwnerIdOnDate(ownerId: string, date: Date): Promise<Booking | null>;
	findByCourtIdOnInterval(
		courtId: string,
		startDate: Date,
		endDate: Date,
	): Promise<Booking | null>;
	findManyByOwnerId(ownerId: string, page: number): Promise<Booking[]>;
	findById(id: string): Promise<Booking | null>;
	save(booking: Booking): Promise<Booking>;
}
