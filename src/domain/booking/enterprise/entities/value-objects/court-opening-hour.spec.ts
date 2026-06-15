import { CourtOpeningHour } from './court-opening-hour';

describe('Court opening hour value object', () => {
	it('should create a valid court opening hour', () => {
		const openingHour = CourtOpeningHour.create({
			courtId: 'court-1',
			weekDay: 2,
			opensAtInMinutes: 8 * 60,
			closesAtInMinutes: 22 * 60,
		});

		expect(openingHour.courtId).toBe('court-1');
		expect(openingHour.weekDay).toBe(2);
		expect(openingHour.opensAtInMinutes).toBe(8 * 60);
		expect(openingHour.closesAtInMinutes).toBe(22 * 60);
	});

	it('should not allow invalid weekdays', () => {
		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: -1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		).toThrow();

		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 7,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 22 * 60,
			}),
		).toThrow();
	});

	it('should not allow times outside a single day', () => {
		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: -1,
				closesAtInMinutes: 22 * 60,
			}),
		).toThrow();

		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 1441,
			}),
		).toThrow();
	});

	it('should not allow closing before or at opening', () => {
		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 8 * 60,
			}),
		).toThrow();
	});

	it('should not allow intervals outside 1-hour alignment', () => {
		expect(() =>
			CourtOpeningHour.create({
				courtId: 'court-1',
				weekDay: 1,
				opensAtInMinutes: 8 * 60,
				closesAtInMinutes: 10 * 60 + 30,
			}),
		).toThrow();
	});
});
