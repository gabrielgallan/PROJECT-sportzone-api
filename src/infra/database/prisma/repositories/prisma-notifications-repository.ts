import type { PaginationInput } from '@/core/types/pagination';
import type { NotificationsRepository } from '@/domain/notifications/application/repositories/notifications-repository';
import type { Notification } from '@/domain/notifications/enterprise/entities/notification';
import { PrismaNotificationMapper } from '../mappers/prisma-notification-mapper';
import { prisma } from '../prisma';

export class PrismaNotificationsRepository implements NotificationsRepository {
	async create(notification: Notification) {
		await prisma.notification.create({
			data: PrismaNotificationMapper.toPrisma(notification),
		});

		return;
	}
	async findById(id: string) {
		const notification = await prisma.notification.findUnique({
			where: { id },
		});

		if (!notification) return null;

		return PrismaNotificationMapper.toDomain(notification);
	}

	async markAllAsReadByRecipientId(recipientId: string) {
		await prisma.notification.updateMany({
			where: { recipientId },
			data: {
				readAt: new Date(),
			},
		});

		return;
	}

	async findManyByRecipientId(recipientId: string, { page, limit }: PaginationInput) {
		const [notifications, total] = await Promise.all([
			prisma.notification.findMany({
				where: { recipientId },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.notification.count({
				where: { recipientId },
			}),
		]);

		return {
			data: notifications.map(PrismaNotificationMapper.toDomain),
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async save(notification: Notification) {
		await prisma.notification.update({
			where: {
				id: notification.id.toString(),
			},
			data: PrismaNotificationMapper.toPrisma(notification),
		});

		return;
	}
}
