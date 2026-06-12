import type { CourtImagesRepository } from '@/domain/booking/application/repositories/court-images-repository';
import type { CourtImage } from '@/domain/booking/enterprise/entities/court-image';

export class InMemoryCourtImagesRepository implements CourtImagesRepository {
	public items: CourtImage[] = [];

	async createMany(images: CourtImage[]) {
		this.items.push(...images);
	}

	async deleteMany(images: CourtImage[]) {
		this.items = this.items.filter((item) => {
			return !images.some((image) => image.id.equals(item.id));
		});
	}

	async findManyByCourtId(courtId: string) {
		return this.items.filter((image) => image.courtId.toString() === courtId);
	}

	async deleteManyByCourtId(courtId: string) {
		this.items = this.items.filter((image) => image.courtId.toString() !== courtId);
	}
}
