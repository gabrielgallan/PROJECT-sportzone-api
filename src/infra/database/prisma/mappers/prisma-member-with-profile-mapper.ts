import { MemberWithProfile } from "@/domain/identity/enterprise/entities/value-objects/member-with-profile";
import { Prisma } from "generated/prisma/client";
import { PrismaRoleMapper } from "./prisma-role-mapper";

type PrismaMemberWithProfile = Prisma.MemberGetPayload<{
    select: {
        role: true
        createdAt: true,
        user: {
            select: {
                id: true
                name: true,
                email: true,
                avatarUrl: true
            }
        },
    }
}>

export class PrismaMemberWithProfileMapper {
    static toDomain(raw: PrismaMemberWithProfile): MemberWithProfile {
        return MemberWithProfile.create({
            user: raw.user,
            membership: {
                role: PrismaRoleMapper.toDomain(raw.role),
                createdAt: raw.createdAt
            }
        })
    }
}