import { repositories } from '@/infra/database';
import { GetBookingDetailsUseCase } from '../get-booking-details';

export function makeGetBookingDetailsUseCase() {
	const getBookingDetailsUseCase = new GetBookingDetailsUseCase(repositories.bookings);

	return getBookingDetailsUseCase;
}
