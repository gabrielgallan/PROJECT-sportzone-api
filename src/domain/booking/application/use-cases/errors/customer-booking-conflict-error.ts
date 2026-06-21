import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class CustomerBookingConflictError extends Error implements UseCaseError {
	constructor() {
		super('Customer already has an active booking during the requested time.');
	}
}
