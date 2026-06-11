import type { Booking } from '../../enterprise/entities/booking';

export interface BookingsRepository {
	create(booking: Booking): Promise<void>;
	findById(bookingId: string): Promise<Booking | null>;
	save(booking: Booking): Promise<void>;
}
