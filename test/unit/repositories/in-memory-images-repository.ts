import type { ImagesRepository } from '@/domain/booking/application/repositories/images-repository';
import type { Image } from '@/domain/booking/enterprise/entities/image';

export class InMemoryImagesRepository implements ImagesRepository {
	public items: Image[] = [];

	async create(image: Image) {
		this.items.push(image);
	}
}
