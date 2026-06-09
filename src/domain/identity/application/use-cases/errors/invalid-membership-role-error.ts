import type { UseCaseError } from "@/core/types/errors/use-case-error";

export class InvalidMembershipRoleError extends Error implements UseCaseError {
	constructor() {
		super("Membership role cannot be updated to owner.");
	}
}
