import type { PaginationInput } from '@/core/types/pagination';
import type { Cordinate } from '@/domain/booking/application/geocoding/cordinate';
import type {
	CourtsFilters,
	CourtsRepository,
} from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';
import { PrismaCourtMapper } from '../mappers/booking/prisma-court-mapper';
import { PrismaCourtDetailsMapper } from '../mappers/booking/vo/prisma-court-details-mapper';
import { PrismaCourtWithCoverMapper } from '../mappers/booking/vo/prisma-court-with-cover-mapper';
import { prisma } from '../prisma';

export class PrismaCourtsRepository implements CourtsRepository {
	async create(court: Court) {
		await prisma.court.create({
			data: PrismaCourtMapper.toPrisma(court),
		});

		return;
	}

	async findById(id: string) {
		const court = await prisma.court.findUnique({
			where: { id },
			include: {
				coverImage: true,
				images: true,
			},
		});

		if (!court) return null;

		return PrismaCourtMapper.toDomain(court);
	}

	async findByIdWithDetails(id: string) {
		const court = await prisma.court.findUnique({
			where: { id },
			include: {
				coverImage: true,
				images: true,
			},
		});

		if (!court) return null;

		return PrismaCourtDetailsMapper.toDomain(court);
	}

	async list({ page, limit }: PaginationInput, { name, address }: CourtsFilters) {
		const where = {
			name: name
				? {
						contains: name,
						mode: 'insensitive' as const,
					}
				: undefined,

			address: address
				? {
						contains: address,
						mode: 'insensitive' as const,
					}
				: undefined,
		};

		const [courts, total] = await Promise.all([
			prisma.court.findMany({
				where,
				include: {
					coverImage: true,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.court.count({
				where,
			}),
		]);

		return {
			data: courts.map(PrismaCourtWithCoverMapper.toDomain),
			meta: {
				total,
				limit,
				page,
			},
		};
	}

	async listNearby(_cordinate: Cordinate, { page, limit }: PaginationInput) {
		const [courts, total] = await Promise.all([
			prisma.court.findMany({
				include: {
					coverImage: true,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.court.count({}),
		]);

		return {
			data: courts.map(PrismaCourtWithCoverMapper.toDomain),
			meta: {
				total,
				limit,
				page,
			},
		};
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const [courts, total] = await Promise.all([
			prisma.court.findMany({
				where: { organizationId },
				include: {
					coverImage: true,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.court.count({
				where: { organizationId },
			}),
		]);

		return {
			data: courts.map(PrismaCourtWithCoverMapper.toDomain),
			meta: {
				total,
				limit,
				page,
			},
		};
	}
}
