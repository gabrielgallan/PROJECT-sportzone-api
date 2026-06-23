import { repositories } from '@/infra/database';
import { ListUserBookingsUseCase } from '../list-user-bookings';

export function makeListUserBookingsUseCase() {
	const listUserBookingsUseCase = new ListUserBookingsUseCase(repositories.bookings);

	return listUserBookingsUseCase;
}
