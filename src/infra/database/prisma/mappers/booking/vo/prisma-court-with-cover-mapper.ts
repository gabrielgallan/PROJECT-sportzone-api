import type { Prisma } from 'generated/prisma/browser';
import { CourtWithCover } from '@/domain/booking/enterprise/entities/value-objects/court-with-cover';
import { PrismaImageMapper } from '../prisma-image-mapper';
import { PrismaSportMapper } from '../prisma-sport-mapper';

type PrismaCourtWithCover = Prisma.CourtGetPayload<{
	include: {
		coverImage: true;
		sports: {
			include: {
				sport: true;
			};
		};
	};
}>;

export class PrismaCourtWithCoverMapper {
	static toDomain(raw: PrismaCourtWithCover): CourtWithCover {
		return CourtWithCover.create({
			courtId: raw.id,
			name: raw.name,
			description: raw.description,
			address: raw.address,
			pricePerHour: raw.pricePerHour,
			rating: raw.rating.toNumber(),
			coverImage: raw.coverImage ? PrismaImageMapper.toDomain(raw.coverImage) : null,
			sports: raw.sports.map((courtSport) => PrismaSportMapper.toDomain(courtSport.sport)),
		});
	}
}
