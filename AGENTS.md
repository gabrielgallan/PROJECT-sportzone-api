# SportZone API

## Project Overview

This repository contains the backend for a court reservation platform. It serves two primary audiences:

- Customers who need to discover courts, review availability, create bookings, manage reservations, and handle payment-related flows when required.
- Administrators who need to manage organizations, members, courts, bookings, and operational data.

The system is being developed as a modular backend with clear domain boundaries so new capabilities can be added without turning the codebase into a tightly coupled monolith.

## Architecture Principles

This project follows Domain-Driven Design (DDD) and Clean Architecture.

- DDD defines the business boundaries, domain language, and modeling approach.
- Clean Architecture defines dependency direction, separation of concerns, and isolation from framework details.
- The application should evolve as a modular monolith organized by subdomains, not as a collection of unrelated features.

Contributors should keep domain rules independent from delivery and infrastructure concerns. Dependencies should point inward toward the business core.

## Subdomain Organization

The current subdomain language for this project is:

- `identity`
- `notifications`
- `bookings`

`identity` and `notifications` are already implemented. `bookings` is the next major subdomain under active development and should be treated as the canonical name for reservation-related capabilities in documentation and new code discussions.

Subdomains should remain focused and isolated. Cross-subdomain collaboration should happen through explicit contracts, orchestrated application flows, or domain events when needed, never through accidental coupling.

As the project grows, mature subdomains may define their own local `AGENTS.md` files with deeper rules, terminology, and implementation guidance specific to that area.

## Folder and Layer Guidelines

The current structure already reflects the intended layering:

- `src/core`: shared building blocks, primitives, base entities, shared value objects, and cross-domain types.
- `src/domain/<subdomain>/enterprise`: entities, value objects, aggregates, and domain rules.
- `src/domain/<subdomain>/application`: use cases, ports, repositories, service contracts, and orchestration logic.
- `src/infra`: framework and adapter code such as HTTP, authentication, database access, email, storage, and other external integrations.
- `test`: broader test support and integration-style verification when applicable.
- `prisma`: persistence schema and database-related configuration.

General rules:

- Keep business logic inside domain and application layers.
- Do not leak framework, ORM, HTTP, or provider-specific details into enterprise models.
- Prefer interfaces/contracts in the application layer and concrete adapters in infrastructure.
- Shared code belongs in `core` only when it is truly cross-domain and not a hidden dependency shortcut.

## Technology and Testing Philosophy

Current primary technology choices:

- TypeScript
- Fastify for the HTTP API
- Prisma for persistence
- Zod-based validation at the API boundary
- Vitest for automated testing

Testing is part of the architecture, not a final polish step.

- Use automated unit tests for domain behavior and application use cases.
- Add integration tests for infrastructure adapters and HTTP flows when the behavior depends on real wiring.
- New modules and use cases should be introduced with tests, not postponed to a later phase.

## Contributor Expectations

Keep this file as the root architectural guide. It should remain high-level, stable, and useful for onboarding.

- Follow the existing DDD and Clean Architecture boundaries before introducing new folders or abstractions.
- Keep infrastructure flexible and replaceable through ports and adapters.
- Treat external providers, plugins, and third-party services as implementation details, never as domain dependencies.
- Prefer small, cohesive modules with clear names and explicit responsibilities.
- Use nested `AGENTS.md` files for subdomain-specific rules instead of overloading this root document with local detail.

When in doubt, optimize for clear boundaries, testable application services, and a domain model that can outlive framework and provider changes.
