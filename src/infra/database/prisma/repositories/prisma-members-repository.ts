import type { PaginationInput } from '@/core/types/pagination';
import type { MembersRepository } from '@/domain/identity/application/repositories/members-repository';
import type { Member } from '@/domain/identity/enterprise/entities/member';
import { PrismaMemberMapper } from '../mappers/prisma-member-mapper';
import { PrismaMemberWithProfileMapper } from '../mappers/prisma-member-with-profile-mapper';
import { PrismaOrganizationWithRoleMapper } from '../mappers/prisma-organization-with-role-mapper';
import { prisma } from '../prisma';

export class PrismaMembersRepository implements MembersRepository {
	async create(member: Member) {
		const data = PrismaMemberMapper.toPrisma(member);

		await prisma.member.create({
			data,
		});

		return;
	}

	async findById(memberId: string) {
		const member = await prisma.member.findUnique({
			where: {
				id: memberId,
			},
		});

		if (!member) return null;

		return PrismaMemberMapper.toDomain(member);
	}

	async findManyByUserId(userId: string) {
		const members = await prisma.member.findMany({
			where: {
				userId,
			},
		});

		return members.map(PrismaMemberMapper.toDomain);
	}

	async findByUserIdAndOrganizationId(userId: string, organizationId: string) {
		const member = await prisma.member.findUnique({
			where: {
				organizationId_userId: {
					userId,
					organizationId,
				},
			},
		});

		if (!member) return null;

		return PrismaMemberMapper.toDomain(member);
	}

	async listWithOrganizationByUserId(userId: string, { page, limit }: PaginationInput) {
		const [organizationsWithRole, total] = await Promise.all([
			prisma.member.findMany({
				where: { userId },
				skip: (page - 1) * limit,
				take: limit,
				select: {
					createdAt: true,
					role: true,
					organization: true,
				},
			}),

			prisma.member.count({
				where: { userId },
			}),
		]);

		return {
			data: organizationsWithRole.map(PrismaOrganizationWithRoleMapper.toDomain),
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const [memberships, total] = await Promise.all([
			prisma.member.findMany({
				where: { organizationId },
				skip: (page - 1) * limit,
				take: limit,
				select: {
					id: true,
					role: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							avatarUrl: true,
						},
					},
				},
			}),
			prisma.member.count({
				where: {
					organizationId,
				},
			}),
		]);

		return {
			data: memberships.map(PrismaMemberWithProfileMapper.toDomain),
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async save(member: Member) {
		await prisma.member.update({
			where: { id: member.id.toString() },
			data: PrismaMemberMapper.toPrisma(member),
		});

		return;
	}

	async delete(member: Member) {
		await prisma.member.delete({
			where: { id: member.id.toString() },
		});

		return;
	}
}
