import type { ImagesRepository } from '@/domain/booking/application/repositories/images-repository';
import type { Image } from '@/domain/booking/enterprise/entities/image';
import { PrismaImageMapper } from '../mappers/booking/prisma-image-mapper';
import { prisma } from '../prisma';

export class PrismaImagesRepository implements ImagesRepository {
	async create(image: Image): Promise<void> {
		await prisma.image.create({
			data: PrismaImageMapper.toPrisma(image),
		});
	}
}
