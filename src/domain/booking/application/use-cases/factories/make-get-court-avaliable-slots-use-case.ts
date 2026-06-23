import { repositories } from '@/infra/database';
import { GetCourtAvaliableSlotsUseCase } from '../get-court-avaliable-slots';

export function makeGetCourtAvaliableSlotsUseCase() {
	const getCourtAvaliableSlotsUseCase = new GetCourtAvaliableSlotsUseCase(
		repositories.courts,
		repositories.bookings,
		repositories.courtOpeningHours,
	);

	return getCourtAvaliableSlotsUseCase;
}
