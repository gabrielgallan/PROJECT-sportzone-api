import { InMemoryBookingsRepository } from 'test/unit/repositories/in-memory-bookings-repository';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryCustomersRepository } from 'test/unit/repositories/in-memory-customers-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking } from '../../enterprise/entities/booking';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Image } from '../../enterprise/entities/image';
import { ListUserBookingsUseCase } from './list-user-bookings';

let courtsRepository: InMemoryCourtsRepository;
let bookingsRepository: InMemoryBookingsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let customersRepository: InMemoryCustomersRepository;
let imagesRepository: InMemoryImagesRepository;

let sut: ListUserBookingsUseCase;

describe('List user bookings use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);
		customersRepository = new InMemoryCustomersRepository();
		bookingsRepository = new InMemoryBookingsRepository(courtsRepository, customersRepository, imagesRepository);

		sut = new ListUserBookingsUseCase(bookingsRepository);
	});

	it('should be able to list user bookings', async () => {
		await imagesRepository.create(
			Image.create(
				{
					title: 'Court 1 cover',
					url: 'https://example.com/court-1-cover.jpg',
				},
				new UniqueEntityID('image-1'),
			),
		);

		await imagesRepository.create(
			Image.create(
				{
					title: 'Court 2 cover',
					url: 'https://example.com/court-2-cover.jpg',
				},
				new UniqueEntityID('image-2'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 1',
					coverImage: CourtImage.create({
						courtId: new UniqueEntityID('court-1'),
						imageId: new UniqueEntityID('image-1'),
					}),
					address: 'Street 1',
					latitude: -23.4567,
					longitude: -46.4567,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-1'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-2'),
					name: 'Court 2',
					coverImage: CourtImage.create({
						courtId: new UniqueEntityID('court-2'),
						imageId: new UniqueEntityID('image-2'),
					}),
					address: 'Street 2',
					latitude: -23.5567,
					longitude: -46.5567,
					pricePerHour: Cash.fromCents(4000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-2'),
			),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('user-1'),
				startsAt: new Date('2026-06-11T10:00:00.000Z'),
				endsAt: new Date('2026-06-11T11:00:00.000Z'),
				price: Cash.fromCents(3000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-2'),
				customerId: new UniqueEntityID('user-1'),
				startsAt: new Date('2026-06-11T12:00:00.000Z'),
				endsAt: new Date('2026-06-11T13:00:00.000Z'),
				price: Cash.fromCents(4000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('user-2'),
				startsAt: new Date('2026-06-11T14:00:00.000Z'),
				endsAt: new Date('2026-06-11T15:00:00.000Z'),
				price: Cash.fromCents(5000),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.bookingsList.data).toHaveLength(2);
			expect(result.value.bookingsList.data.map((item) => item.booking.customerId.toString())).toEqual([
				'user-1',
				'user-1',
			]);
			expect(result.value.bookingsList.data.map((item) => item.court.name)).toEqual([
				'Court 1',
				'Court 2',
			]);
			expect(result.value.bookingsList.data.map((item) => item.court.coverImage?.id.toString())).toEqual([
				'image-1',
				'image-2',
			]);
			expect(result.value.bookingsList.data.map((item) => item.court.coverImage?.title)).toEqual([
				'Court 1 cover',
				'Court 2 cover',
			]);
			expect(result.value.bookingsList.data.map((item) => item.court.coverImage?.url)).toEqual([
				'https://example.com/court-1-cover.jpg',
				'https://example.com/court-2-cover.jpg',
			]);
			expect(result.value.bookingsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});
});
