import type { MembersRepository } from '@/domain/identity/application/repositories/members-repository';
import type { Member } from '@/domain/identity/enterprise/entities/member';
import { prisma } from '..';
import { PrismaMemberMapper } from '../mappers/prisma-member-mapper';
import { Pagination } from '@/core/types/pagination';
import { PrismaMemberWithProfileMapper } from '../mappers/prisma-member-with-profile-mapper';

export class PrismaMembersRepository implements MembersRepository {
	async create(member: Member) {
		const data = PrismaMemberMapper.toPrisma(member)

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

	async listByOrganizationId(
			organizationId: string,
			pagination: Pagination,
		) {
			const { page, limit } = pagination

			const memberships = await prisma.member.findMany({
				where: { organizationId },
				skip: (page - 1) * limit,
				take: limit,
				select: {
					role: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							avatarUrl: true
						}
					}
				}
			})

			return memberships.map(PrismaMemberWithProfileMapper.toDomain)
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
