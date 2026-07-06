import { Prisma } from 'generated/prisma/client';
import type { PaginationInput } from '@/core/types/pagination';
import type { Cordinate } from '@/domain/booking/application/geocoding/cordinate';
import type {
	CourtsFilters,
	CourtsRepository,
	OrganizationCourtsFilters,
} from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';
import type { CourtOpeningHour } from '@/domain/booking/enterprise/entities/court-opening-hour';
import { PrismaCourtMapper } from '../mappers/booking/prisma-court-mapper';
import { PrismaCourtOpeningHourMapper } from '../mappers/booking/prisma-court-opening-hour-mapper';
import { PrismaCourtDetailsMapper } from '../mappers/booking/vo/prisma-court-details-mapper';
import { PrismaCourtWithCoverMapper } from '../mappers/booking/vo/prisma-court-with-cover-mapper';
import { prisma } from '../prisma';
import { linkCourtImages, unlinkCourtImages } from './prisma-court-images-repository';
import { linkCourtSports, unlinkCourtSports } from './prisma-court-sports-repository';

interface NearbyCourtRow {
	id: string;
	distance: number;
}

interface CountRow {
	total: bigint;
}

export class PrismaCourtsRepository implements CourtsRepository {
	async create(court: Court) {
		await prisma.$transaction(async (transaction) => {
			await transaction.court.create({
				data: PrismaCourtMapper.toPrisma(court),
			});

			await linkCourtImages(transaction, court.images.getItems());
			await linkCourtSports(transaction, court.sports.getItems());
		});

		return;
	}

	async createWithOpeningHours(court: Court, openingHours: CourtOpeningHour[]) {
		await prisma.$transaction(async (transaction) => {
			await transaction.court.create({
				data: PrismaCourtMapper.toPrisma(court),
			});

			await linkCourtImages(transaction, court.images.getItems());
			await linkCourtSports(transaction, court.sports.getItems());

			if (openingHours.length > 0) {
				await transaction.courtOpeningHour.createMany({
					data: openingHours.map(PrismaCourtOpeningHourMapper.toPrisma),
				});
			}
		});
	}

	async findById(id: string) {
		const court = await prisma.court.findUnique({
			where: { id },
			include: {
				coverImage: true,
				images: true,
				sports: true,
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

	async list({ page, limit }: PaginationInput, { name, address, sportSlug }: CourtsFilters) {
		const where: Prisma.CourtWhereInput = {
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
			sports: sportSlug
				? {
						some: {
							sport: {
								slug: sportSlug,
							},
						},
					}
				: undefined,
			status: 'ONLINE',
		};

		const [courts, total] = await Promise.all([
			prisma.court.findMany({
				where,
				include: {
					coverImage: true,
					sports: {
						include: {
							sport: true,
						},
					},
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

	async listNearby({ latitude, longitude }: Cordinate, { page, limit }: PaginationInput) {
		const radiusInKm = 10;
		const offset = (page - 1) * limit;
		const distanceSql = Prisma.sql`
			6371 * acos(
				least(
					1,
					cos(radians(${latitude})) * cos(radians(latitude::double precision)) *
					cos(radians(longitude::double precision) - radians(${longitude})) +
					sin(radians(${latitude})) * sin(radians(latitude::double precision))
				)
			)
		`;

		const [nearbyRows, countRows] = await Promise.all([
			prisma.$queryRaw<NearbyCourtRow[]>(Prisma.sql`
				SELECT id, ${distanceSql} AS distance
				FROM courts
				WHERE status = 'ONLINE' AND ${distanceSql} <= ${radiusInKm}
				ORDER BY distance ASC, id ASC
				LIMIT ${limit} OFFSET ${offset}
			`),
			prisma.$queryRaw<CountRow[]>(Prisma.sql`
				SELECT count(*)::bigint AS total
				FROM courts
				WHERE status = 'ONLINE' AND ${distanceSql} <= ${radiusInKm}
			`),
		]);

		const ids = nearbyRows.map((row) => row.id);
		const courts = await prisma.court.findMany({
			where: { id: { in: ids } },
			include: {
				coverImage: true,
				sports: {
					include: {
						sport: true,
					},
				},
			},
		});
		const courtsById = new Map(courts.map((court) => [court.id, court]));
		const orderedCourts = ids.flatMap((id) => {
			const court = courtsById.get(id);
			return court ? [court] : [];
		});

		return {
			data: orderedCourts.map(PrismaCourtWithCoverMapper.toDomain),
			meta: {
				total: Number(countRows[0]?.total ?? 0n),
				limit,
				page,
			},
		};
	}

	async listByOrganizationId(
		organizationId: string,
		{ name, status }: OrganizationCourtsFilters,
		{ page, limit }: PaginationInput,
	) {
		const where: Prisma.CourtWhereInput = {
			organizationId,
			name: name
				? {
						contains: name,
						mode: 'insensitive' as const,
					}
				: undefined,
			status,
		};

		const [courts, total] = await Promise.all([
			prisma.court.findMany({
				where,
				include: {
					coverImage: true,
					sports: {
						include: {
							sport: true,
						},
					},
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

	async save(court: Court) {
		const data = PrismaCourtMapper.toPrisma(court);

		await prisma.$transaction(async (transaction) => {
			await transaction.court.update({
				where: { id: court.id.toString() },
				data,
			});

			await unlinkCourtImages(transaction, court.images.getRemovedItems());
			await linkCourtImages(transaction, court.images.getNewItems());
			await unlinkCourtSports(transaction, court.sports.getRemovedItems());
			await linkCourtSports(transaction, court.sports.getNewItems());
		});
	}

	async saveWithOpeningHours(court: Court, openingHours: CourtOpeningHour[]) {
		const data = PrismaCourtMapper.toPrisma(court);
		const courtId = court.id.toString();

		await prisma.$transaction(async (transaction) => {
			await transaction.court.update({
				where: { id: courtId },
				data,
			});

			await unlinkCourtImages(transaction, court.images.getRemovedItems());
			await linkCourtImages(transaction, court.images.getNewItems());
			await unlinkCourtSports(transaction, court.sports.getRemovedItems());
			await linkCourtSports(transaction, court.sports.getNewItems());
			await transaction.courtOpeningHour.deleteMany({ where: { courtId } });

			if (openingHours.length > 0) {
				await transaction.courtOpeningHour.createMany({
					data: openingHours.map(PrismaCourtOpeningHourMapper.toPrisma),
				});
			}
		});
	}

	async delete(court: Court) {
		await prisma.court.delete({
			where: {
				id: court.id.toString(),
			},
		});
	}
}
