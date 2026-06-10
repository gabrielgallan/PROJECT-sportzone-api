import type { FastifyInstance } from 'fastify';
import { plugins } from '@/infra/auth';
import { listNotificationsController } from '../controllers/notifications/list-notifications';
import { readAllNotificationsController } from '../controllers/notifications/read-all-notifications';
import { readNotificationController } from '../controllers/notifications/read-notification';

export function notificationsRoutes(app: FastifyInstance) {
	app.register(plugins.authPlugin);

	app.register(listNotificationsController);
	app.register(readNotificationController);
	app.register(readAllNotificationsController);
}
