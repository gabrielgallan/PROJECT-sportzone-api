import { ValueObject } from '@/core/entities/value-object';

interface CourtOpeningHourProps {
	courtId: string;
	weekDay: number;
	opensAtInMinutes: number;
	closesAtInMinutes: number;
}

export class CourtOpeningHour extends ValueObject<CourtOpeningHourProps> {
	static create(props: CourtOpeningHourProps) {
		this.validate(props);

		return new CourtOpeningHour(props);
	}

	get courtId() {
		return this.props.courtId;
	}

	get weekDay() {
		return this.props.weekDay;
	}

	get opensAtInMinutes() {
		return this.props.opensAtInMinutes;
	}

	get closesAtInMinutes() {
		return this.props.closesAtInMinutes;
	}

	private static validate({
		weekDay,
		opensAtInMinutes,
		closesAtInMinutes,
	}: CourtOpeningHourProps) {
		if (weekDay < 0 || weekDay > 6) {
			throw new Error('Court opening hour week day must be between 0 and 6.');
		}

		if (opensAtInMinutes < 0 || opensAtInMinutes > 1439) {
			throw new Error('Court opening time must be between 0 and 1439 minutes.');
		}

		if (closesAtInMinutes < 1 || closesAtInMinutes > 1440) {
			throw new Error('Court closing time must be between 1 and 1440 minutes.');
		}

		if (closesAtInMinutes <= opensAtInMinutes) {
			throw new Error('Court closing time must be after opening time.');
		}

		if ((closesAtInMinutes - opensAtInMinutes) % 60 !== 0) {
			throw new Error('Court opening hours must align with 1-hour slots.');
		}
	}
}
