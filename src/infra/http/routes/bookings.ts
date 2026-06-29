import type { FastifyInstance } from 'fastify';
import { plugins } from '@/infra/auth';
import { createBookingController } from '../controllers/bookings/create-booking';
import { createCourtController } from '../controllers/bookings/create-court';
import { editCourtController } from '../controllers/bookings/edit-court';
import { getBookingDetailsController } from '../controllers/bookings/get-booking-details';
import { getCourtAvailableTimeSlotsController } from '../controllers/bookings/get-court-available-time-slots';
import { getCourtDetailsController } from '../controllers/bookings/get-court-details';
import { getOrganizationCountsController } from '../controllers/bookings/get-organization-counts';
import { listCourtReviewsController } from '../controllers/bookings/list-court-reviews';
import { listOrganizationBookingsController } from '../controllers/bookings/list-organization-bookings';
import { listOrganizationCourtsController } from '../controllers/bookings/list-organizations-court';
import { listUserBookingsController } from '../controllers/bookings/list-user-bookings';
import { reviewCourtController } from '../controllers/bookings/review-court';
import { searchCourtsController } from '../controllers/bookings/search-courts';
import { searchNearbyCourtsController } from '../controllers/bookings/search-nearby-court';
import { uploadImageController } from '../controllers/bookings/upload-image';

export function bookingsRoutes(app: FastifyInstance) {
	app.register(plugins.authPlugin);

	app.register(getOrganizationCountsController);
	app.register(uploadImageController);
	app.register(createCourtController);
	app.register(editCourtController);
	app.register(searchCourtsController);
	app.register(searchNearbyCourtsController);
	app.register(getCourtDetailsController);
	app.register(getCourtAvailableTimeSlotsController);
	app.register(listCourtReviewsController);
	app.register(listOrganizationCourtsController);
	app.register(reviewCourtController);

	app.register(createBookingController);
	app.register(listUserBookingsController);
	app.register(getBookingDetailsController);
	app.register(listOrganizationBookingsController);
}
