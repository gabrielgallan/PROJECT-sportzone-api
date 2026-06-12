import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking } from '../../enterprise/entities/booking';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { GetBookingDetailsUseCase } from './get-booking-details';
import { InMemoryBookingsRepository } from 'test/unit/repositories/in-memory-bookings-repository';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';

let courtsRepository: InMemoryCourtsRepository;
let bookingsRepository: InMemoryBookingsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;

let sut: GetBookingDetailsUseCase;

describe('Get booking details use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository);
		bookingsRepository = new InMemoryBookingsRepository(courtsRepository);

		sut = new GetBookingDetailsUseCase(bookingsRepository);
	});

	it('should be able to get booking details', async () => {
		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 1',
					coverImage: null,
					address: 'Street 1',
					latitude: -23.4567,
					longitude: -46.4567,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-1'),
			),
		);

		await bookingsRepository.create(
			Booking.create(
				{
					courtId: new UniqueEntityID('court-1'),
					customerId: new UniqueEntityID('user-1'),
					startsAt: new Date('2026-06-12T10:00:00.000Z'),
					endsAt: new Date('2026-06-12T11:00:00.000Z'),
					price: Cash.fromCents(3000),
				},
				new UniqueEntityID('booking-1'),
			),
		);

		const result = await sut.execute({
			bookingId: 'booking-1',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.booking.booking.id.toString()).toBe('booking-1');
			expect(result.value.booking.booking.customerId.toString()).toBe('user-1');
			expect(result.value.booking.court.id).toBe('court-1');
			expect(result.value.booking.court.name).toBe('Court 1');
			expect(result.value.booking.court.address).toBe('Street 1');
		}
	});

	it('should not be able to get details from a non-existing booking', async () => {
		const result = await sut.execute({
			bookingId: 'non-existing-booking-id',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
