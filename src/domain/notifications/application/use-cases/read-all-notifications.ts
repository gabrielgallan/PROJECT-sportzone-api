import type { NotificationsRepository } from '../repositories/notifications-repository';

interface ReadAllNotificationsUseCaseRequest {
	recipientId: string;
}

type ReadAllNotificationsUseCaseResponse = null;

export class ReadAllNotificationsUseCase {
	constructor(private notificationsRepository: NotificationsRepository) {}

	async execute({
		recipientId,
	}: ReadAllNotificationsUseCaseRequest): Promise<ReadAllNotificationsUseCaseResponse> {
		await this.notificationsRepository.markAllAsReadByRecipientId(recipientId);

		return null;
	}
}
