import { Prisma } from 'generated/prisma/client';
import type { PaginationInput } from '@/core/types/pagination';
import type {
	BookingCreationConstraints,
	BookingCreationResult,
	BookingsRepository,
} from '@/domain/booking/application/repositories/bookings-repository';
import type { Booking, BookingStatus } from '@/domain/booking/enterprise/entities/booking';
import { PrismaBookingMapper } from '../mappers/booking/prisma-booking-mapper';
import { PrismaBookingWithCourtMapper } from '../mappers/booking/vo/prisma-booking-with-court-mapper';
import { PrismaOrganizationBookingMapper } from '../mappers/booking/vo/prisma-organization-booking-mapper';
import { prisma } from '../prisma';

const bookingOrderBy: Prisma.BookingOrderByWithRelationInput[] = [
	{ createdAt: 'desc' },
	{ id: 'desc' },
];

export class PrismaBookingsRepository implements BookingsRepository {
	async create(
		booking: Booking,
		constraints?: BookingCreationConstraints,
	): Promise<BookingCreationResult> {
		return prisma.$transaction(async (transaction) => {
			await transaction.$queryRaw(
				Prisma.sql`SELECT id FROM courts WHERE id = ${booking.courtId.toString()} FOR UPDATE`,
			);
			await transaction.$queryRaw(
				Prisma.sql`SELECT id FROM users WHERE id = ${booking.customerId.toString()} FOR UPDATE`,
			);

			if (constraints) {
				const activeBookingWhere: Prisma.BookingWhereInput = {
					OR: [
						{ status: 'CONFIRMED' },
						{ status: 'PENDING', expiresAt: { gt: constraints.now } },
					],
				};

				const [courtConflict, customerBooking] = await Promise.all([
					transaction.booking.findFirst({
						where: {
							AND: [activeBookingWhere],
							courtId: booking.courtId.toString(),
							startsAt: { lt: booking.endsAt },
							endsAt: { gt: booking.startsAt },
						},
						select: { id: true },
					}),
					transaction.booking.findFirst({
						where: {
							AND: [activeBookingWhere],
							userId: booking.customerId.toString(),
							startsAt: { lt: constraints.dayEndsAt },
							endsAt: { gt: constraints.dayStartsAt },
						},
						select: { id: true },
					}),
				]);

				if (courtConflict) return { status: 'COURT_CONFLICT' };
				if (customerBooking) return { status: 'CUSTOMER_DAILY_LIMIT' };
			}

			await transaction.booking.create({ data: PrismaBookingMapper.toPrisma(booking) });

			return { status: 'CREATED' };
		});
	}

	async findById(bookingId: string) {
		const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
		return booking ? PrismaBookingMapper.toDomain(booking) : null;
	}

	async findByIdWithCourt(bookingId: string) {
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				court: {
					select: { id: true, name: true, address: true, coverImage: true },
				},
			},
		});

		return booking ? PrismaBookingWithCourtMapper.toDomain(booking) : null;
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const where: Prisma.BookingWhereInput = { court: { organizationId } };
		const [bookings, total] = await Promise.all([
			prisma.booking.findMany({
				where,
				include: {
					court: { select: { id: true, name: true } },
					user: { select: { id: true, email: true } },
				},
				orderBy: bookingOrderBy,
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.booking.count({ where }),
		]);

		return {
			data: bookings.map((booking) => PrismaOrganizationBookingMapper.toDomain(booking)),
			meta: { page, limit, total },
		};
	}

	async listByUserId(userId: string, { page, limit }: PaginationInput) {
		const where: Prisma.BookingWhereInput = { userId };
		const [bookings, total] = await Promise.all([
			prisma.booking.findMany({
				where,
				include: {
					court: {
						select: { id: true, name: true, address: true, coverImage: true },
					},
				},
				orderBy: bookingOrderBy,
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.booking.count({ where }),
		]);

		return {
			data: bookings.map((booking) => PrismaBookingWithCourtMapper.toDomain(booking)),
			meta: { page, limit, total },
		};
	}

	async findManyByCourtIdBetweenDates(
		courtId: string,
		range: { startsAt: Date; endsAt: Date },
		statuses: BookingStatus[],
	) {
		return this.findManyBetweenDates({ courtId }, range, statuses);
	}

	async findManyByCustomerIdBetweenDates(
		customerId: string,
		range: { startsAt: Date; endsAt: Date },
		statuses: BookingStatus[],
	) {
		return this.findManyBetweenDates({ userId: customerId }, range, statuses);
	}

	async save(booking: Booking) {
		await prisma.booking.update({
			where: { id: booking.id.toString() },
			data: PrismaBookingMapper.toPrisma(booking),
		});
	}

	private async findManyBetweenDates(
		owner: Pick<Prisma.BookingWhereInput, 'courtId' | 'userId'>,
		range: { startsAt: Date; endsAt: Date },
		statuses: BookingStatus[],
	) {
		const bookings = await prisma.booking.findMany({
			where: {
				...owner,
				status: { in: statuses },
				startsAt: { lt: range.endsAt },
				endsAt: { gt: range.startsAt },
			},
			orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
		});

		return bookings.map(PrismaBookingMapper.toDomain);
	}
}
