import type { UseCaseError } from '@/core/types/errors/use-case-error';

export class ResourceAlreadyExistsError extends Error implements UseCaseError {
	constructor() {
		super('This resource already exists.');
	}
}
