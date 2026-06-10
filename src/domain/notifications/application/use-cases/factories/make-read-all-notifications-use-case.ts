import { repositories } from '@/infra/database';
import { ReadAllNotificationsUseCase } from '../read-all-notifications';

export function makeReadAllNotificationsUseCase() {
	const readAllNotificationsUseCase = new ReadAllNotificationsUseCase(repositories.notifications);

	return readAllNotificationsUseCase;
}
