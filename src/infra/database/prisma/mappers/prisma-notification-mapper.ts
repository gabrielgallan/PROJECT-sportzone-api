import type { Notification as PrismaNotification } from "generated/prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Notification } from "@/domain/notifications/enterprise/entities/notification";

export class PrismaNotificationMapper {
    static toDomain(raw: PrismaNotification): Notification {
        return Notification.create({
            recipientId: new UniqueEntityID(raw.recipientId),
            title: raw.title,
            content: raw.content,
            readAt: raw.readAt,
            createdAt: raw.createdAt
        }, new UniqueEntityID(raw.id))
    }

    static toPrisma(notification: Notification): PrismaNotification {
        return {
            id: notification.id.toString(),
            recipientId: notification.recipientId.toString(),
            title: notification.title,
            content: notification.content,
            readAt: notification.readAt ?? null,
            createdAt: notification.createdAt
        }
    }
}