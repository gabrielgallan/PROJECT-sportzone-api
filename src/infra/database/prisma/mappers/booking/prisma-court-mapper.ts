import { Prisma } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '@/domain/booking/enterprise/entities/court';
import { CourtImagesList } from '@/domain/booking/enterprise/entities/court-images-list';
import { PrismaCourtStatusMapper } from '../enums/prisma-court-status-mapper';
import { PrismaCourtImageMapper } from './prisma-court-image-mapper';

type PrismaCourt = Prisma.CourtGetPayload<{
	include: {
		coverImage: true;
		images: true;
	};
}>;

export class PrismaCourtMapper {
	static toDomain(raw: PrismaCourt): Court {
		const coverImage = raw.coverImage
			? PrismaCourtImageMapper.toDomain({ ...raw.coverImage, courtId: raw.id })
			: null;

		return Court.create(
			{
				organizationId: new UniqueEntityID(raw.organizationId),
				name: raw.name,
				description: raw.description,
				address: raw.address,
				coverImage,
				images: new CourtImagesList(raw.images.map(PrismaCourtImageMapper.toDomain)),
				status: PrismaCourtStatusMapper.toDomain(raw.status),
				latitude: raw.latitude.toNumber(),
				longitude: raw.longitude.toNumber(),
				pricePerHour: Cash.fromCents(raw.pricePerHour),
				rating: raw.rating.toNumber(),
				reviewsCount: raw.reviewsCount,
				createdAt: raw.createdAt,
				updatedAt: raw.updatedAt ?? null,
			},
			new UniqueEntityID(raw.id),
		);
	}

	static toPrisma(court: Court): Prisma.CourtUncheckedCreateInput {
		return {
			id: court.id.toString(),
			organizationId: court.organizationId.toString(),
			name: court.name,
			description: court.description ?? null,
			address: court.address,
			coverImageId: court.coverImage?.imageId.toString() ?? null,
			status: PrismaCourtStatusMapper.toPrisma(court.status),
			latitude: new Prisma.Decimal(court.latitude),
			longitude: new Prisma.Decimal(court.longitude),
			pricePerHour: court.pricePerHour.toCents(),
			rating: new Prisma.Decimal(court.rating),
			reviewsCount: court.reviewsCount,
			createdAt: court.createdAt,
			updatedAt: court.updatedAt ?? null,
		};
	}
}
