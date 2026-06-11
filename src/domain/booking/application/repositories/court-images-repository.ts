import type { CourtImage } from '../../enterprise/entities/court-image';

export interface CourtImagesRepository {
	createMany(images: CourtImage[]): Promise<void>;
	deleteMany(images: CourtImage[]): Promise<void>;
	findManyByCourtId(courtId: string): Promise<CourtImage[]>;
	deleteManyByCourtId(courtId: string): Promise<void>;
}
