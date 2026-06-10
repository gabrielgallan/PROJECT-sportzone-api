import { repositories } from '@/infra/database';
import { SendNotificationUseCase } from '../send-notification';

export function makeSendNotificationUseCase() {
	const sendNotificationUseCase = new SendNotificationUseCase(repositories.notifications);

	return sendNotificationUseCase;
}
