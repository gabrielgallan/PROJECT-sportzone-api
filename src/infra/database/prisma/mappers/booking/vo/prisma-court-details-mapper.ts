import type { Prisma } from 'generated/prisma/browser';
import { CourtDetails } from '@/domain/booking/enterprise/entities/value-objects/court-details';
import { PrismaImageMapper } from '../prisma-image-mapper';

type PrismaCourtDetails = Prisma.CourtGetPayload<{
	include: {
		images: true;
	};
}>;

export class PrismaCourtWithCoverMapper {
	static toDomain(raw: PrismaCourtDetails): CourtDetails {
		return CourtDetails.create({
			courtId: raw.id,
			name: raw.name,
			description: raw.description,
			address: raw.address,
			latitude: raw.latitude.toNumber(),
			longitude: raw.longitude.toNumber(),
			pricePerHour: raw.pricePerHour,
			rating: raw.rating.toNumber(),
			reviewsCount: raw.reviewsCount,
			images: raw.images.map(PrismaImageMapper.toDomain),
		});
	}
}
