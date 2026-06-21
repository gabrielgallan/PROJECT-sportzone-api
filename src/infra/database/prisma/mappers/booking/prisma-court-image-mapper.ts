import type { Prisma, Image as PrismaImage } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { CourtImage } from '@/domain/booking/enterprise/entities/court-image';

export class PrismaCourtImageMapper {
	static toDomain(raw: PrismaImage): CourtImage {
		if (!raw.courtId) {
			throw new Error('Image missing courtId');
		}

		return CourtImage.create(
			{
				courtId: new UniqueEntityID(raw.courtId),
				imageId: new UniqueEntityID(raw.id),
			},
			new UniqueEntityID(raw.id),
		);
	}

	static toPrismaUpdateMany(images: CourtImage[]): Prisma.ImageUpdateManyArgs {
		const imagesIds = images.map((image) => {
			return image.imageId.toString();
		});

		return {
			where: {
				id: {
					in: imagesIds,
				},
			},
			data: {
				courtId: images[0].courtId.toString(),
			},
		};
	}
}
