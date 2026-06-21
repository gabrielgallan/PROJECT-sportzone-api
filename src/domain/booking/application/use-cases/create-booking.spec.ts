import { makeCourt } from 'test/unit/factories/make-court';
import { makeCustomer } from 'test/unit/factories/make-customer';
import { InMemoryBookingsRepository } from 'test/unit/repositories/in-memory-bookings-repository';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryCustomersRepository } from 'test/unit/repositories/in-memory-customers-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking } from '../../enterprise/entities/booking';
import { CourtOpeningHour } from '../../enterprise/entities/court-opening-hour';
import { CreateBookingUseCase } from './create-booking';
import { CourtAlreadyReservedError } from './errors/court-already-reserved';
import { CourtUnavailableError } from './errors/court-unavailable-error';
import { CustomerBookingLimitError } from './errors/customer-booking-limit-error';
import { InvalidBookingDatetimeError } from './errors/invalid-booking-datetime-error';

let bookingsRepository: InMemoryBookingsRepository;
let customersRepository: InMemoryCustomersRepository;
let courtsRepository: InMemoryCourtsRepository;
let courtOpeningHoursRepository: InMemoryCourtOpeningHoursRepository;

let sut: CreateBookingUseCase;

describe('Create booking use case', () => {
	beforeEach(() => {
		customersRepository = new InMemoryCustomersRepository();

		courtsRepository = new InMemoryCourtsRepository(
			new InMemoryCourtImagesRepository(),
			new InMemoryImagesRepository(),
		);

		courtOpeningHoursRepository = new InMemoryCourtOpeningHoursRepository();

		bookingsRepository = new InMemoryBookingsRepository(
			courtsRepository,
			customersRepository,
			new InMemoryImagesRepository(),
		);

		sut = new CreateBookingUseCase(
			bookingsRepository,
			courtsRepository,
			customersRepository,
			courtOpeningHoursRepository,
		);

		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should be able to create a valid booking', async () => {
		await makeValidBookingScenario();

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 10, 0, 0),
			endDate: new Date(2026, 5, 22, 12, 0, 0),
		});

		expect(result.isRight()).toBe(true);
		expect(bookingsRepository.items).toHaveLength(1);
	});

	it('should not be able to create a booking with invalid customer or court', async () => {
		vi.setSystemTime(new Date(2026, 5, 22, 8, 0, 0));

		const result = await sut.execute({
			userId: 'invalid-user',
			courtId: 'invalid-court',
			startDate: new Date(2026, 5, 22, 10, 0, 0),
			endDate: new Date(2026, 5, 22, 12, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});

	it('should not be able to create a booking in an unavailable court', async () => {
		vi.setSystemTime(new Date(2026, 5, 22, 8, 0, 0));

		customersRepository.items.push(makeCustomer({}, new UniqueEntityID('user-1')));

		await courtsRepository.create(makeCourt({ status: 'PAUSED' }, new UniqueEntityID('court-1')));

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 10, 0, 0),
			endDate: new Date(2026, 5, 22, 12, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(CourtUnavailableError);
	});

	it('should not be able to create a booking less than 1 hour in advance', async () => {
		await makeValidBookingScenario();

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 8, 30, 0),
			endDate: new Date(2026, 5, 22, 9, 30, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidBookingDatetimeError);
	});

	it('should not be able to create a booking more than 90 days in advance', async () => {
		await makeValidBookingScenario();

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 8, 21, 10, 0, 0),
			endDate: new Date(2026, 8, 21, 12, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidBookingDatetimeError);
	});

	it('should not be able to create a booking when the court is closed on the selected day', async () => {
		vi.setSystemTime(new Date(2026, 5, 22, 8, 0, 0));

		customersRepository.items.push(makeCustomer({}, new UniqueEntityID('user-1')));

		await courtsRepository.create(makeCourt({ status: 'ONLINE' }, new UniqueEntityID('court-1')));

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 10, 0, 0),
			endDate: new Date(2026, 5, 22, 12, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidBookingDatetimeError);
	});

	it('should not be able to create a booking outside court opening hours', async () => {
		await makeValidBookingScenario();

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 7, 0, 0),
			endDate: new Date(2026, 5, 22, 8, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(InvalidBookingDatetimeError);
	});

	it('should not be able to create a booking when customer already has a booking for today', async () => {
		await makeValidBookingScenario();

		bookingsRepository.items.push(
			Booking.create({
				customerId: new UniqueEntityID('user-1'),
				courtId: new UniqueEntityID('court-1'),
				startsAt: new Date(2026, 5, 22, 13, 0, 0),
				endsAt: new Date(2026, 5, 22, 14, 0, 0),
				price: Cash.fromCents(10000),
				createdAt: new Date(),
				expiresAt: new Date(2026, 5, 22, 8, 15, 0),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 10, 0, 0),
			endDate: new Date(2026, 5, 22, 12, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(CustomerBookingLimitError);
	});

	it('should not be able to create a booking when court is already reserved', async () => {
		await makeValidBookingScenario();

		customersRepository.items.push(makeCustomer({}, new UniqueEntityID('user-2')));

		bookingsRepository.items.push(
			Booking.create({
				customerId: new UniqueEntityID('user-2'),
				courtId: new UniqueEntityID('court-1'),
				startsAt: new Date(2026, 5, 22, 10, 0, 0),
				endsAt: new Date(2026, 5, 22, 12, 0, 0),
				price: Cash.fromCents(10000),
				createdAt: new Date(),
				expiresAt: new Date(2026, 5, 22, 8, 15, 0),
			}),
		);

		const result = await sut.execute({
			userId: 'user-1',
			courtId: 'court-1',
			startDate: new Date(2026, 5, 22, 11, 0, 0),
			endDate: new Date(2026, 5, 22, 13, 0, 0),
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(CourtAlreadyReservedError);
	});
});

async function makeValidBookingScenario() {
	vi.setSystemTime(new Date(2026, 5, 22, 8, 0, 0));

	customersRepository.items.push(makeCustomer({}, new UniqueEntityID('user-1')));

	await courtsRepository.create(
		makeCourt({ name: 'Sport Clube', status: 'ONLINE' }, new UniqueEntityID('court-1')),
	);

	await courtOpeningHoursRepository.createMany([
		CourtOpeningHour.create({
			courtId: 'court-1',
			weekDay: 1,
			opensAtInMinutes: 480, // 08:00
			closesAtInMinutes: 1320, // 22:00
		}),
	]);
}
