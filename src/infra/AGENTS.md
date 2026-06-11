# Infrastructure Layer Guide

## Purpose of the Infrastructure Layer

`src/infra` is the outer layer of the application. It is responsible for delivery, framework integration, concrete adapters, and composition of the services used by the system.

This layer is intentionally more pragmatic than `domain`. It may contain framework-specific and provider-specific code, but it should still remain organized, explicit, and replaceable.

## Main Responsibilities in This Folder

This folder owns the concrete implementation details that connect the application to the outside world, including:

- HTTP controllers, routes, request validation, and response handling
- framework bootstrap and plugin wiring
- database access, repositories, and mappers
- auth providers and request hooks
- cryptography services
- email and storage providers
- presenters, environment loading, and external service integration

Examples already present in this codebase include Fastify controllers and routes, Prisma repositories and mappers, auth providers, Cloudinary storage, Resend email delivery, and composition through `index.ts` modules.

## Preferred Patterns

Infrastructure should adapt the outside world to the contracts defined by the application layer.

- Adapters should implement interfaces defined in `domain/.../application`.
- Repositories should translate persistence records into domain objects through dedicated mappers.
- Controllers should validate input at the boundary, call use cases, translate known errors, and shape transport responses without embedding business policy.
- Presenters should convert domain output into HTTP-friendly response shapes.
- Plugins and provider registries may centralize framework-specific setup.
- Composition modules such as `index.ts` should assemble reusable concrete services for the rest of the system.

When external providers fail, prefer translating those failures into infrastructure-level errors that make sense for the transport layer.

## Where Flexibility Is Allowed

This layer is allowed to use controlled escapes when integration work demands it.

- Framework-specific lifecycle hooks are acceptable here.
- Provider-specific request/response handling is acceptable here.
- Small pragmatic adaptations are acceptable when they reduce duplication or make integration clearer.

That flexibility exists to simplify delivery concerns, not to weaken the architecture. Infrastructure may be less pure than domain, but it still must respect the contracts and boundaries of the application.

## Rules That Still Must Not Be Broken

Flexibility does not mean anything goes.

- Do not move business rules, policy decisions, or core orchestration into controllers or provider adapters.
- Do not return raw ORM models or provider payloads directly into the domain when meaningful mapping is required.
- Do not skip mappers or presenters when translation is part of the contract.
- Do not let Fastify, Prisma, Cloudinary, Resend, or other external details leak back into domain code.
- Keep implementations replaceable so repositories, auth providers, storage, and email services can change without rewriting business rules.

Good infrastructure code should be practical at the edges, disciplined at the boundaries, and easy to swap when technical choices evolve.
