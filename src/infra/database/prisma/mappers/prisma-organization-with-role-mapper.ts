import type { Prisma } from 'generated/prisma/client';
import { OrganizationWithRole } from '@/domain/identity/enterprise/entities/value-objects/organization-with-role';
import { PrismaOrganizationMapper } from './prisma-organization-mapper';
import { PrismaRoleMapper } from './prisma-role-mapper';

type PrismaOrganizationWithRole = Prisma.MemberGetPayload<{
	select: {
		role: true;
		createdAt: true;
		organization: true;
	};
}>;

export class PrismaOrganizationWithRoleMapper {
	static toDomain(raw: PrismaOrganizationWithRole): OrganizationWithRole {
		return OrganizationWithRole.create({
			role: PrismaRoleMapper.toDomain(raw.role),
			organization: PrismaOrganizationMapper.toDomain(raw.organization),
		});
	}
}
