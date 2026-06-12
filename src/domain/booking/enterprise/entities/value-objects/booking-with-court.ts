import { ValueObject } from '@/core/entities/value-object';
import type { Booking } from '../booking';
import type { CourtImage } from '../court-image';

interface BookingWithCourtProps {
	booking: Booking;
	court: {
		id: string;
		name: string;
		address: string;
		coverImage: CourtImage | null;
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
