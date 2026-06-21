import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class InvalidBookingDatetimeError extends Error implements UseCaseError {
	constructor(msg?: string) {
		super(msg ?? 'Invalid booking datetime!');
	}
}
