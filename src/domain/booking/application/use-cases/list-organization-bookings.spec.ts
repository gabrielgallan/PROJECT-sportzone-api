import { InMemoryBookingsRepository } from 'test/unit/repositories/in-memory-bookings-repository';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryCustomersRepository } from 'test/unit/repositories/in-memory-customers-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking } from '../../enterprise/entities/booking';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Customer } from '../../enterprise/entities/customer';
import { ListOrganizationBookingsUseCase } from './list-organization-bookings';

let courtsRepository: InMemoryCourtsRepository;
let bookingsRepository: InMemoryBookingsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository;
let customersRepository: InMemoryCustomersRepository;

let sut: ListOrganizationBookingsUseCase;

describe('List organization bookings use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		customersRepository = new InMemoryCustomersRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);
		bookingsRepository = new InMemoryBookingsRepository(
			courtsRepository,
			customersRepository,
			imagesRepository,
		);

		sut = new ListOrganizationBookingsUseCase(bookingsRepository);
	});

	it('should be able to list organization bookings', async () => {
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

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 2',
					coverImage: null,
					address: 'Street 2',
					latitude: -23.5567,
					longitude: -46.5567,
					pricePerHour: Cash.fromCents(4000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-2'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-2'),
					name: 'Court 3',
					coverImage: null,
					address: 'Street 3',
					latitude: -23.6567,
					longitude: -46.6567,
					pricePerHour: Cash.fromCents(5000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-3'),
			),
		);

		customersRepository.items.push(
			Customer.create(
				{
					email: 'customer-1@sportzone.dev',
				},
				new UniqueEntityID('customer-1'),
			),
			Customer.create(
				{
					email: 'customer-2@sportzone.dev',
				},
				new UniqueEntityID('customer-2'),
			),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('customer-1'),
				startsAt: new Date('2026-06-11T10:00:00.000Z'),
				endsAt: new Date('2026-06-11T11:00:00.000Z'),
				price: Cash.fromCents(3000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-2'),
				customerId: new UniqueEntityID('customer-2'),
				startsAt: new Date('2026-06-11T12:00:00.000Z'),
				endsAt: new Date('2026-06-11T13:00:00.000Z'),
				price: Cash.fromCents(4000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-3'),
				customerId: new UniqueEntityID('customer-3'),
				startsAt: new Date('2026-06-11T14:00:00.000Z'),
				endsAt: new Date('2026-06-11T15:00:00.000Z'),
				price: Cash.fromCents(5000),
			}),
		);

		const result = await sut.execute({
			organizationId: 'org-1',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.bookingsList.data).toHaveLength(2);
			expect(result.value.bookingsList.data.map((item) => item.booking.courtId.toString())).toEqual(
				['court-1', 'court-2'],
			);
			expect(result.value.bookingsList.data.map((item) => item.court.name)).toEqual([
				'Court 1',
				'Court 2',
			]);
			expect(result.value.bookingsList.data.map((item) => item.customer.email)).toEqual([
				'customer-1@sportzone.dev',
				'customer-2@sportzone.dev',
			]);
			expect(result.value.bookingsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});

	it('should be able to list organization bookings by date range and status', async () => {
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

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-2'),
					name: 'Court 2',
					coverImage: null,
					address: 'Street 2',
					latitude: -23.5567,
					longitude: -46.5567,
					pricePerHour: Cash.fromCents(4000),
					images: new CourtImagesList([]),
				},
				new UniqueEntityID('court-2'),
			),
		);

		customersRepository.items.push(
			Customer.create(
				{
					email: 'customer-1@sportzone.dev',
				},
				new UniqueEntityID('customer-1'),
			),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('customer-1'),
				startsAt: new Date('2026-06-10T10:00:00.000Z'),
				endsAt: new Date('2026-06-10T11:00:00.000Z'),
				status: 'CONFIRMED',
				price: Cash.fromCents(3000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('customer-1'),
				startsAt: new Date('2026-06-15T10:00:00.000Z'),
				endsAt: new Date('2026-06-15T11:00:00.000Z'),
				status: 'CANCELLED',
				price: Cash.fromCents(3000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-1'),
				customerId: new UniqueEntityID('customer-1'),
				startsAt: new Date('2026-06-30T10:00:00.000Z'),
				endsAt: new Date('2026-06-30T11:00:00.000Z'),
				status: 'CONFIRMED',
				price: Cash.fromCents(3000),
			}),
		);

		await bookingsRepository.create(
			Booking.create({
				courtId: new UniqueEntityID('court-2'),
				customerId: new UniqueEntityID('customer-1'),
				startsAt: new Date('2026-06-10T10:00:00.000Z'),
				endsAt: new Date('2026-06-10T11:00:00.000Z'),
				status: 'CONFIRMED',
				price: Cash.fromCents(4000),
			}),
		);

		const result = await sut.execute({
			organizationId: 'org-1',
			dateRange: {
				from: new Date('2026-06-01T00:00:00.000Z'),
				to: new Date('2026-06-20T23:59:59.999Z'),
			},
			status: 'CONFIRMED',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.bookingsList.data).toHaveLength(1);
			expect(result.value.bookingsList.data[0].booking.courtId.toString()).toBe('court-1');
			expect(result.value.bookingsList.data[0].booking.status).toBe('CONFIRMED');
			expect(result.value.bookingsList.data[0].booking.startsAt).toEqual(
				new Date('2026-06-10T10:00:00.000Z'),
			);
			expect(result.value.bookingsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 1,
			});
		}
	});
});
