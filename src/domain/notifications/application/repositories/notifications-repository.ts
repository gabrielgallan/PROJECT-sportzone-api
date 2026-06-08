import type { PaginatedList, PaginationInput } from '@/core/types/pagination';
import type { Notification } from '../../enterprise/entities/notification';

export interface NotificationsRepository {
	create(notification: Notification): Promise<void>;
	findById(id: string): Promise<Notification | null>;
	markAllAsReadByRecipientId(recipietId: string): Promise<void>
	findManyByRecipientId(
		recipietId: string,
		pagination: PaginationInput,
	): Promise<PaginatedList<Notification[]>>;
	save(notification: Notification): Promise<Notification>;
}
