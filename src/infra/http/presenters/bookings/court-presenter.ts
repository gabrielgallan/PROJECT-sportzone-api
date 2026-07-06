import type z from 'zod';
import type { CourtDetails } from '@/domain/booking/enterprise/entities/value-objects/court-details';
import type { CourtWithCover } from '@/domain/booking/enterprise/entities/value-objects/court-with-cover';
import type { courtDetailsSchema } from '../../controllers/bookings/get-court-details';
import type { courtWithCoverSchema } from '../../controllers/bookings/search-courts';

export class CourtWithCoverPresenter {
	static toHTTP(court: CourtWithCover): z.infer<typeof courtWithCoverSchema> {
		return {
			courtId: court.courtId,
			name: court.name,
			description: court.description,
			address: court.address,
			coverUrl: court.coverImage ? court.coverImage.url : null,
			pricePerHour: court.pricePerHour,
			rating: court.rating,
			sports: court.sports.map((sport) => ({
				name: sport.name,
				slug: sport.slug.value,
			})),
		};
	}
}

export class CourtDetailsPresenter {
	static toHTTP(court: CourtDetails): z.infer<typeof courtDetailsSchema> {
		return {
			courtId: court.courtId,
			name: court.name,
			description: court.description,
			address: court.address,
			latitude: court.latitude,
			longitude: court.longitude,
			images: court.images.map((image) => image.url),
			pricePerHour: court.pricePerHour,
			rating: court.rating,
			reviewsCount: court.reviewsCount,
		};
	}
}
