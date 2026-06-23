import type { Prisma } from 'generated/prisma/client';
import type { CourtImagesRepository } from '@/domain/booking/application/repositories/court-images-repository';
import type { CourtImage } from '@/domain/booking/enterprise/entities/court-image';
import { PrismaCourtImageMapper } from '../mappers/booking/prisma-court-image-mapper';
import { prisma } from '../prisma';

type ImagePersistenceClient = Pick<Prisma.TransactionClient, 'image'>;

export class CourtImageLinkError extends Error {
	constructor() {
		super('One or more images do not exist or are already linked to another court.');
	}
}

export async function linkCourtImages(
	client: ImagePersistenceClient,
	images: CourtImage[],
): Promise<void> {
	if (images.length === 0) return;

	const args = PrismaCourtImageMapper.toPrismaUpdateMany(images);
	const courtId = images[0].courtId.toString();
	const result = await client.image.updateMany({
		...args,
		where: {
			AND: [
				args.where ?? {},
				{
					OR: [{ courtId: null }, { courtId }],
				},
			],
		},
	});

	if (result.count !== images.length) {
		throw new CourtImageLinkError();
	}
}

export async function unlinkCourtImages(
	client: ImagePersistenceClient,
	images: CourtImage[],
): Promise<void> {
	if (images.length === 0) return;

	const imagesByCourt = new Map<string, CourtImage[]>();

	for (const image of images) {
		const courtId = image.courtId.toString();
		imagesByCourt.set(courtId, [...(imagesByCourt.get(courtId) ?? []), image]);
	}

	for (const [courtId, courtImages] of imagesByCourt) {
		await client.image.updateMany({
			where: {
				courtId,
				id: { in: courtImages.map((image) => image.imageId.toString()) },
			},
			data: { courtId: null },
		});
	}
}

export class PrismaCourtImagesRepository implements CourtImagesRepository {
	async createMany(images: CourtImage[]) {
		await linkCourtImages(prisma, images);
	}

	async deleteMany(images: CourtImage[]) {
		await unlinkCourtImages(prisma, images);
	}

	async findManyByCourtId(courtId: string) {
		const images = await prisma.image.findMany({
			where: { courtId },
			orderBy: { id: 'asc' },
		});

		return images.map(PrismaCourtImageMapper.toDomain);
	}

	async deleteManyByCourtId(courtId: string) {
		await prisma.image.updateMany({
			where: { courtId },
			data: { courtId: null },
		});
	}
}
