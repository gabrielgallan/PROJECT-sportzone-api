import type { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { type Either, right } from '@/core/types/either';
import type { NotificationsRepository } from '../repositories/notifications-repository';

interface ReadAllNotificationsUseCaseRequest {
	recipientId: string;
}

type ReadAllNotificationsUseCaseResponse = Either<ResourceNotFoundError, null>;

export class ReadAllNotificationsUseCase {
	constructor(private notificationsRepository: NotificationsRepository) {}

	async execute({
		recipientId,
	}: ReadAllNotificationsUseCaseRequest): Promise<ReadAllNotificationsUseCaseResponse> {
		await this.notificationsRepository.markAllAsReadByRecipientId(recipientId);

		return right(null);
	}
}
