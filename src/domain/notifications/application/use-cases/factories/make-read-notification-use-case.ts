import { repositories } from '@/infra/database';
import { ReadNotificationUseCase } from '../read-notification';

export function makeReadNotificationUseCase() {
	const readNotificationUseCase = new ReadNotificationUseCase(repositories.notifications);

	return readNotificationUseCase;
}
