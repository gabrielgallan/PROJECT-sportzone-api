import { repositories } from '@/infra/database';
import { CreateBookingUseCase } from '../create-booking';

export function makeCreateBookingUseCase() {
	const createBookingUseCase = new CreateBookingUseCase(
		repositories.bookings,
		repositories.courts,
		repositories.customers,
		repositories.courtOpeningHours,
	);

	return createBookingUseCase;
}
