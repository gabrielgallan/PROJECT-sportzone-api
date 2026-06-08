import type { OrganizationsRepository } from '@/domain/identity/application/repositories/organizations-repository';
import type { Organization } from '@/domain/identity/enterprise/entities/organization';
import { prisma } from '..';
import { PrismaOrganizationMapper } from '../mappers/prisma-organization-mapper';

export class PrismaOrganizationsRepository implements OrganizationsRepository {
	async create(organization: Organization) {
		const data = PrismaOrganizationMapper.toPrisma(organization);

		await prisma.organization.create({
			data,
		});

		return;
	}

	async findById(organizationId: string) {
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) return null;

		return PrismaOrganizationMapper.toDomain(organization);
	}

	async findBySlug(slug: string) {
		const organization = await prisma.organization.findUnique({
			where: { slug },
		});

		if (!organization) return null;

		return PrismaOrganizationMapper.toDomain(organization);
	}

	async findManyByIds(organizationIds: string[]) {
		const organizations = await prisma.organization.findMany({
			where: { id: { in: organizationIds } },
		});

		return organizations.map(PrismaOrganizationMapper.toDomain);
	}

	async save(organization: Organization) {
		const data = PrismaOrganizationMapper.toPrisma(organization);

		await prisma.organization.update({
			where: {
				id: organization.id.toString(),
			},
			data,
		});

		return;
	}
}
