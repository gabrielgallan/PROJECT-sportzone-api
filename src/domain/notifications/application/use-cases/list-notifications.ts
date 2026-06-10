import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Notification } from '../../enterprise/entities/notification';
import type { NotificationsRepository } from '../repositories/notifications-repository';

interface ListNotificationsUseCaseRequest {
	recipientId: string;
	pagination?: PaginationInput;
}

type ListNotificationsUseCaseResponse = { notifications: PaginatedList<Notification[]> };

export class ListNotificationsUseCase {
	constructor(private notificationsRepository: NotificationsRepository) {}

	async execute({
		recipientId,
		pagination = { page: 1, limit: 10 },
	}: ListNotificationsUseCaseRequest): Promise<ListNotificationsUseCaseResponse> {
		const notifications = await this.notificationsRepository.findManyByRecipientId(
			recipientId,
			pagination,
		);

		return {
			notifications,
		};
	}
}
