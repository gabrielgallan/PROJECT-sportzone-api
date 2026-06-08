import type { Organization as PrismaOrganization } from "generated/prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Organization } from "@/domain/identity/enterprise/entities/organization";

export class PrismaOrganizationMapper {
    static toDomain(raw: PrismaOrganization): Organization {
        return Organization.create(
            {
                ownerId: new UniqueEntityID(raw.ownerId),
                name: raw.name,
                avatarUrl: raw.avatarUrl,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityID(raw.id),
        );
    }

    static toPrisma(org: Organization): PrismaOrganization {
        return {
            id: org.id.toString(),
            ownerId: org.ownerId.toString(),
            slug: org.slug.value,
            name: org.name,
            avatarUrl: org.avatarUrl ?? null,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt ?? null,
        };
    }
}
