import { InMemoryCourtOpeningHoursRepository } from 'test/unit/repositories/in-memory-court-opening-hours-repository';
import { CourtOpeningHour } from '../../enterprise/entities/value-objects/court-opening-hour';

let repository: InMemoryCourtOpeningHoursRepository;

describe('Court opening hours repository', () => {
	beforeEach(() => {
		repository = new InMemoryCourtOpeningHoursRepository();
	});

	it('should list opening hours by court id', async () => {
		await repository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 3,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
			CourtOpeningHour.create({
				courtId: 'court-2',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		]);

		const openingHours = await repository.findManyByCourtId('court-1');

		expect(openingHours.map((item) => item.weekDay)).toEqual([1, 3]);
	});

	it('should find an opening hour by court id and weekday', async () => {
		await repository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 2,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		]);

		const openingHour = await repository.findByCourtIdAndWeekDay('court-1', 2);

		expect(openingHour?.weekDay).toBe(2);
	});

	it('should delete all opening hours by court id', async () => {
		await repository.createMany([
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 0,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 6,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		]);

		await repository.deleteManyByCourtId('court-1');

		expect(repository.items).toHaveLength(0);
	});
});
