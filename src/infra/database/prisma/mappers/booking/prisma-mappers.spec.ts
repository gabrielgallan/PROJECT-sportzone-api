import { Prisma } from 'generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { CourtImage } from '@/domain/booking/enterprise/entities/court-image';
import { PrismaCourtImageMapper } from './prisma-court-image-mapper';
import { PrismaCourtMapper } from './prisma-court-mapper';
import { PrismaCourtOpeningHourMapper } from './prisma-court-opening-hour-mapper';

describe('Booking Prisma mappers', () => {
	it('preserves a court opening hour id', () => {
		const openingHour = PrismaCourtOpeningHourMapper.toDomain({
			id: 'opening-hour-1',
			courtId: 'court-1',
			weekDay: 1,
			opensAtInMinutes: 480,
			closesAtInMinutes: 1080,
		});

		expect(openingHour.id.toString()).toBe('opening-hour-1');
		expect(PrismaCourtOpeningHourMapper.toPrisma(openingHour).id).toBe('opening-hour-1');
	});

	it('hydrates and preserves court image relationships', () => {
		const court = PrismaCourtMapper.toDomain({
			id: 'court-1',
			organizationId: 'organization-1',
			name: 'Court',
			description: null,
			coverImageId: 'image-1',
			status: 'ONLINE',
			address: 'Address',
			latitude: new Prisma.Decimal(-23.5),
			longitude: new Prisma.Decimal(-46.6),
			pricePerHour: 10000,
			rating: new Prisma.Decimal(4.5),
			reviewsCount: 2,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: null,
			coverImage: { id: 'image-1', title: 'Cover', url: 'cover.jpg', courtId: null },
			images: [{ id: 'image-2', title: 'Court', url: 'court.jpg', courtId: 'court-1' }],
		});

		expect(court.coverImage?.imageId.toString()).toBe('image-1');
		expect(court.images.getItems()[0].imageId.toString()).toBe('image-2');
		expect(PrismaCourtMapper.toPrisma(court).coverImageId).toBe('image-1');
	});

	it('rejects an empty court image update', () => {
		expect(() => PrismaCourtImageMapper.toPrismaUpdateMany([])).toThrow(
			'Cannot map an empty court image collection.',
		);
	});

	it('rejects a court image update containing multiple courts', () => {
		const images = [
			CourtImage.create({
				courtId: new UniqueEntityID('court-1'),
				imageId: new UniqueEntityID('image-1'),
			}),
			CourtImage.create({
				courtId: new UniqueEntityID('court-2'),
				imageId: new UniqueEntityID('image-2'),
			}),
		];

		expect(() => PrismaCourtImageMapper.toPrismaUpdateMany(images)).toThrow(
			'All images must belong to the same court.',
		);
	});
});
