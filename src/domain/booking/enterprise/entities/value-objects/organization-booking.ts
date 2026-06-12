import { ValueObject } from '@/core/entities/value-object';
import type { Booking } from '../booking';

interface OrganizationBookingProps {
	booking: Booking;
	court: {
		id: string;
		name: string;
	};
	customer: {
		id: string;
		email: string;
	};
}

export class OrganizationBooking extends ValueObject<OrganizationBookingProps> {
	static create(props: OrganizationBookingProps) {
		return new OrganizationBooking(props);
	}

	get booking() {
		return this.props.booking;
	}

	get court() {
		return this.props.court;
	}

	get customer() {
		return this.props.customer;
	}
}
