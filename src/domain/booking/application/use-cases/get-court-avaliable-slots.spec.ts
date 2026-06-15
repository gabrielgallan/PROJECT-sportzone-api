import { makeCourt } from 'test/unit/factories/make-court';
import { InMemoryBookingsRepository } from 'test/unit/repositories/in-memory-bookings-repository';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryCustomersRepository } from 'test/unit/repositories/in-memory-customers-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking, type BookingStatus } from '../../enterprise/entities/booking';
import { CourtOpeningHour } from '../../enterprise/entities/value-objects/court-opening-hour';
import { GetCourtAvaliableSlotsUseCase } from './get-court-avaliable-slots';

let courtsRepository: InMemoryCourtsRepository;
let bookingsRepository: InMemoryBookingsRepository;
let courtOpeningHoursRepository: InMemoryCourtOpeningHoursRepository;
let sut: GetCourtAvaliableSlotsUseCase;

function makeBooking({
	id,
	startsAt,
	endsAt,
	status = 'CONFIRMED',
	courtId = 'court-1',
}: {
	id: string;
	startsAt: string;
	endsAt: string;
	status?: BookingStatus;
	courtId?: string;
}) {
	return Booking.create(
		{
			courtId: new UniqueEntityID(courtId),
			customerId: new UniqueEntityID('user-1'),
			startsAt: new Date(startsAt),
			endsAt: new Date(endsAt),
			status,
			price: Cash.fromCents(3000),
		},
		new UniqueEntityID(id),
	);
}

describe('Get available time slots by date use case', () => {
	beforeEach(() => {
		vi.useRealTimers();

		const courtImagesRepository = new InMemoryCourtImagesRepository();
		const imagesRepository = new InMemoryImagesRepository();
		courtOpeningHoursRepository = new InMemoryCourtOpeningHoursRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);
		bookingsRepository = new InMemoryBookingsRepository(
			courtsRepository,
			new InMemoryCustomersRepository(),
			imagesRepository,
		);

		sut = new GetCourtAvaliableSlotsUseCase(
			courtsRepository,
			bookingsRepository,
			courtOpeningHoursRepository,
		);
	});

	it('should return resource not found when court does not exist', async () => {
		const result = await sut.execute({
			courtId: 'non-existing-court-id',
			date: '2026-06-16',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});

	it('should return an empty array when there is no opening hour for the selected weekday', async () => {
		await courtsRepository.create(makeCourt({}, new UniqueEntityID('court-1')));

		const result = await sut.execute({
			courtId: 'court-1',
			date: '2026-06-16',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.timeSlots).toEqual([]);
		}
	});

	it('should return all 1-hour slots as available when there are no bookings', async () => {
		await courtsRepository.create(makeCourt({}, new UniqueEntityID('court-1')));
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 2,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 12 * 60,
			}),
		]);

		const result = await sut.execute({
			courtId: 'court-1',
			date: '2026-06-16',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.timeSlots).toEqual([
				{ time: '2026-06-16T11:00:00.000Z', available: true },
				{ time: '2026-06-16T12:00:00.000Z', available: true },
				{ time: '2026-06-16T13:00:00.000Z', available: true },
				{ time: '2026-06-16T14:00:00.000Z', available: true },
			]);
		}
	});

	it('should block slots for pending and confirmed bookings only', async () => {
		await courtsRepository.create(makeCourt({}, new UniqueEntityID('court-1')));
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 2,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 12 * 60,
			}),
		]);
		await bookingsRepository.create(
			makeBooking({
				id: 'booking-pending',
				startsAt: '2026-06-16T12:00:00.000Z',
				endsAt: '2026-06-16T13:00:00.000Z',
				status: 'PENDING',
			}),
		);
		await bookingsRepository.create(
			makeBooking({
				id: 'booking-confirmed',
				startsAt: '2026-06-16T13:00:00.000Z',
				endsAt: '2026-06-16T14:00:00.000Z',
				status: 'CONFIRMED',
			}),
		);
		await bookingsRepository.create(
			makeBooking({
				id: 'booking-cancelled',
				startsAt: '2026-06-16T14:00:00.000Z',
				endsAt: '2026-06-16T15:00:00.000Z',
				status: 'CANCELLED',
			}),
		);
		await bookingsRepository.create(
			makeBooking({
				id: 'booking-completed',
				startsAt: '2026-06-16T11:00:00.000Z',
				endsAt: '2026-06-16T12:00:00.000Z',
				status: 'COMPLETED',
			}),
		);

		const result = await sut.execute({
			courtId: 'court-1',
			date: '2026-06-16',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.timeSlots.map((slot) => slot.available)).toEqual([
				true,
				false,
				false,
				true,
			]);
		}
	});

	it('should mark overlapping bookings as unavailable across multiple slots', async () => {
		await courtsRepository.create(makeCourt({}, new UniqueEntityID('court-1')));
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 2,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 12 * 60,
			}),
		]);
		await bookingsRepository.create(
			makeBooking({
				id: 'booking-overlap',
				startsAt: '2026-06-16T11:30:00.000Z',
				endsAt: '2026-06-16T13:30:00.000Z',
				status: 'CONFIRMED',
			}),
		);

		const result = await sut.execute({
			courtId: 'court-1',
			date: '2026-06-16',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.timeSlots.map((slot) => slot.available)).toEqual([
				false,
				false,
				false,
				true,
			]);
		}
	});

	it('should mark past slots as unavailable only on the current day', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-15T13:30:00.000Z'));

		await courtsRepository.create(makeCourt({}, new UniqueEntityID('court-1')));
		await courtOpeningHoursRepository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 12 * 60,
			}),
		]);

		const result = await sut.execute({
			courtId: 'court-1',
			date: '2026-06-15',
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.timeSlots.map((slot) => slot.available)).toEqual([
				false,
				false,
				false,
				true,
			]);
		}
	});
});
