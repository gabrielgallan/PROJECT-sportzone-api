import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class CourtUnavailableError extends Error implements UseCaseError {
	constructor() {
		super('The selected court is not available for bookings.');
	}
}
