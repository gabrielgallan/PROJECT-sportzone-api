import type { UseCaseError } from "@/core/types/errors/use-case-error";

export class InsufficientPermissionsError
	extends Error
	implements UseCaseError
{
	constructor() {
		super("Only organization owners can perform this action.");
	}
}
