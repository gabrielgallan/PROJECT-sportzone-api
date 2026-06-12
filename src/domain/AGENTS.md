# Domain Layer Guide

## Purpose of the Domain Layer

`src/domain` is the most strict and business-centered part of the codebase. It should express the language of the product clearly and keep the main rules of the system independent from HTTP, database, framework, and provider details.

This layer should prioritize simplicity, readability, and stable business abstractions. When in doubt, favor code that is easy to read, easy to test, and easy to evolve.

## Layer Breakdown

Each subdomain is organized by responsibility, usually around `enterprise` and `application`.

- `enterprise` contains entities, value objects, aggregates, and business behavior.
- `application` contains use cases, orchestration, repository and service contracts, factories, and application-level errors.

Current subdomains include `identity`, `notifications`, and `booking`. In this folder, use the existing `booking` name because it matches the current code structure.

## Coding Style and Design Rules

Domain code should be explicit and readable first.

- Prefer clear names over clever abstractions.
- Keep files focused and cohesive, with one main responsibility per file.
- Prefer exported classes for entities, value objects, use cases, and other core business concepts.
- Favor root programming and object-oriented design for domain modeling.
- Use functional style where it improves clarity, but do not let it replace a strong domain model.
- Keep request and response types explicit in use cases, following the current `execute()` pattern.
- Keep factories focused on composition and object creation, never on business rules.

The domain layer must not depend on Fastify, Prisma, HTTP models, Cloudinary, Resend, or other infrastructure details. Any access to persistence, auth, email, storage, cryptography, geocoding, or third-party integration should happen through contracts defined in the application layer.

## Feature Structure for New Capabilities

When adding a new capability, model it around the business flow first.

- Add or extend entities and value objects in `enterprise` when the business concept belongs to the domain model.
- Add use cases in `application/use-cases` when the feature represents an application action or workflow.
- Add repository or service contracts in `application` when the use case depends on external capabilities.
- Add application-specific errors when the use case needs explicit failure states.
- Add factories only when a use case needs a standard composition entry point.

Try to keep orchestration in use cases, behavior in domain objects, and implementation details outside this layer.

## Testing Expectations

Tests are part of the domain contract, not optional follow-up work.

- Keep unit tests close to use cases and domain behavior.
- Write tests around business scenarios and expected outcomes.
- Prefer readable setup and intent-revealing assertions.
- Test behavior, invariants, and failure cases instead of incidental implementation details.
- For application use cases, the default test pattern is:
- Add one `it(...)` for the successful path.
- Add one `it(...)` for each explicit error the use case can return through its `Either`.
- If a use case does not return any error branch, only the success case is required.

Good domain code should be understandable from its names, trusted through its tests, and portable across infrastructure changes.
