import type { FastifyInstance } from 'fastify';
import { plugins } from '@/infra/auth';
import { createCourtController } from '../controllers/bookings/create-court';
import { getCourtAvailableTimeSlotsController } from '../controllers/bookings/get-court-available-time-slots';
import { getCourtDetailsController } from '../controllers/bookings/get-court-details';
import { searchCourtsController } from '../controllers/bookings/search-courts';
import { searchNearbyCourtsController } from '../controllers/bookings/search-nearby-court';
import { uploadImageController } from '../controllers/bookings/upload-image';

export function bookingsRoutes(app: FastifyInstance) {
	app.register(plugins.authPlugin);

	app.register(createCourtController);
	app.register(uploadImageController);
	app.register(searchCourtsController);
	app.register(searchNearbyCourtsController);
	app.register(getCourtDetailsController);
	app.register(getCourtAvailableTimeSlotsController);
}
