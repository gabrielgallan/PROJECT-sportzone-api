import type { PaginationInput } from '@/core/types/pagination';
import type { NotificationsRepository } from '@/domain/notifications/application/repositories/notifications-repository';
import type { Notification } from '@/domain/notifications/enterprise/entities/notification';

export class InMemoryNotificationsRepository implements NotificationsRepository {
	public items: Notification[] = [];

	async create(notification: Notification) {
		this.items.push(notification);
		return;
	}

	async findById(id: string) {
		const notification = this.items.find((n) => n.id.toString() === id);

		return notification ?? null;
	}

	async findManyByRecipientId(recipientId: string, pagination: PaginationInput) {
		const { page, limit } = pagination;

		const notifications = this.items.filter((n) => n.recipientId.toString() === recipientId);

		const paginated = notifications
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice((page - 1) * limit, page * limit);

		return { data: paginated, meta: { page, limit, total: notifications.length } };
	}

	async markAllAsReadByRecipientId(recipientId: string) {
		for (const notification of this.items) {
			const isFromRecipient = notification.recipientId.toString() === recipientId;

			const isUnread = !notification.readAt;

			if (isFromRecipient && isUnread) {
				notification.read();
			}
		}
	}

	async save(notification: Notification) {
		const notificationIndex = this.items.findIndex(
			(n) => n.id.toString() === notification.id.toString(),
		);

		if (notificationIndex >= 0) {
			this.items[notificationIndex] = notification;
		}

		return;
	}
}
