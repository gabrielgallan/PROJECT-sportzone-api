import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class CustomerBookingLimitError extends Error implements UseCaseError {
	constructor(msg?: string) {
		super(msg ?? '');
	}
}
