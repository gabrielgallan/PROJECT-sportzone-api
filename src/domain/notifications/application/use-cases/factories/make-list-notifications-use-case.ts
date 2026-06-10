import { repositories } from '@/infra/database';
import { ListNotificationsUseCase } from '../list-notifications';

export function makeListNotificationsUseCase() {
	const listNotificationsUseCase = new ListNotificationsUseCase(repositories.notifications);

	return listNotificationsUseCase;
}
