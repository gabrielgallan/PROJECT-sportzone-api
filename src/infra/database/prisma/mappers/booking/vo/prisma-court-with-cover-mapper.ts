import type { Prisma } from 'generated/prisma/browser';
import { CourtWithCover } from '@/domain/booking/enterprise/entities/value-objects/court-with-cover';
import { PrismaImageMapper } from '../prisma-image-mapper';

type PrismaCourtWithCover = Prisma.CourtGetPayload<{
	include: {
		coverImage: true;
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
		});
	}
}
