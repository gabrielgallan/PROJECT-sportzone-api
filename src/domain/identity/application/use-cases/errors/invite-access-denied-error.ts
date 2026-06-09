import type { UseCaseError } from "@/core/types/errors/use-case-error";

export class InviteAccessDeniedError extends Error implements UseCaseError {
	constructor() {
		super("You do not have permission to access this invitation.");
	}
}
