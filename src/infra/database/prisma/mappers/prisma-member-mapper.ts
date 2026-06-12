import type { Member as PrismaMember } from "generated/prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member } from "@/domain/identity/enterprise/entities/member";
import { PrismaRoleMapper } from "./enums/prisma-role-mapper";

export class PrismaMemberMapper {
    static toDomain(raw: PrismaMember): Member {
        return Member.create({
            userId: new UniqueEntityID(raw.userId),
            organizationId: new UniqueEntityID(raw.organizationId),
            role: PrismaRoleMapper.toDomain(raw.role),
            createdAt: raw.createdAt
        }, new UniqueEntityID(raw.id))
    }

    static toPrisma(member: Member): PrismaMember {
        return {
            id: member.id.toString(),
            userId: member.userId.toString(),
            organizationId: member.organizationId.toString(),
            role: PrismaRoleMapper.toPrisma(member.role),
            createdAt: member.createdAt
        }
    }
}