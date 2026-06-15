import { faker } from '@faker-js/faker';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Booking, type BookingProps } from '@/domain/booking/enterprise/entities/booking';

export function makeBooking(override: Partial<BookingProps> = {}, id?: UniqueEntityID) {
	const booking = Booking.create(
		{
			courtId: new UniqueEntityID('court-1'),
			customerId: new UniqueEntityID('customer-1'),
			startsAt: new Date(),
			endsAt: new Date(),
			price: Cash.fromAmount(faker.number.int({ min: 60, max: 220 })),
			createdAt: new Date(),
			...override,
		},
		id,
	);

	return booking;
}
