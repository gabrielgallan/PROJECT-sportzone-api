import type { Prisma, Sport as PrismaSport } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/shared/value-objects/slug';
import { Sport } from '@/domain/booking/enterprise/entities/sport';

export class PrismaSportMapper {
	static toDomain(raw: PrismaSport): Sport {
		return Sport.create(
			{
				name: raw.name,
				slug: new Slug(raw.slug),
			},
			new UniqueEntityID(raw.id),
		);
	}

	static toPrisma(sport: Sport): Prisma.SportUncheckedCreateInput {
		return {
			id: sport.id.toString(),
			name: sport.name,
			slug: sport.slug.value,
		};
	}
}
