import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class CourtAlreadyReservedError extends Error implements UseCaseError {
	constructor() {
		super('The selected court already has an active booking during the requested time.');
	}
}
