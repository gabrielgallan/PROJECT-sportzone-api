import { repositories } from '@/infra/database';
import { ListOrganizationBookingsUseCase } from '../list-organization-bookings';

export function makeListOrganizationBookingsUseCase() {
	const listOrganizationBookingsUseCase = new ListOrganizationBookingsUseCase(
		repositories.bookings,
	);

	return listOrganizationBookingsUseCase;
}
