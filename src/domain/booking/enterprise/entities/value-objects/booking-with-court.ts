import { ValueObject } from '@/core/entities/value-object';
import type { Booking } from '../booking';
import type { Image } from '../image';

interface BookingWithCourtProps {
	booking: Booking;
	court: {
		id: string;
		name: string;
		address: string;
		coverImage: Image;
	};
}

export class BookingWithCourt extends ValueObject<BookingWithCourtProps> {
	static create(props: BookingWithCourtProps) {
		return new BookingWithCourt(props);
	}

	get booking() {
		return this.props.booking;
	}

	get court() {
		return this.props.court;
	}
}
