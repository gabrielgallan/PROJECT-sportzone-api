import { faker } from '@faker-js/faker';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court, type CourtProps } from '@/domain/booking/enterprise/entities/court';
import { CourtImagesList } from '@/domain/booking/enterprise/entities/court-images-list';

export function makeCourt(override: Partial<CourtProps> = {}, id?: UniqueEntityID) {
	const court = Court.create(
		{
			organizationId: new UniqueEntityID('org-1'),
			name: faker.company.name(),
			address: faker.location.street(),
			coverImage: null,
			images: new CourtImagesList([]),
			latitude: -23.45,
			longitude: -46.8,
			createdAt: new Date(),
			pricePerHour: Cash.fromAmount(faker.number.int({ min: 60, max: 220 })),
			...override,
		},
		id,
	);

	return court;
}
