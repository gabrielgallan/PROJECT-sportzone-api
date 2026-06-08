import type { UseCaseError } from "@/core/types/errors/use-case-error";

export class OrganizationAlreadyExistsError extends Error implements UseCaseError {
    constructor() {
        super("This organization already exists.");
    }
}
