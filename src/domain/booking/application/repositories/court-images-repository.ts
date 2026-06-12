import type { CourtImage } from '../../enterprise/entities/court-image';

export interface CourtImagesRepository {
	createMany(images: CourtImage[]): Promise<void>;
	deleteMany(images: CourtImage[]): Promise<void>; // used in edit use case with watched list pattern
	
	findManyByCourtId(courtId: string): Promise<CourtImage[]>;
	deleteManyByCourtId(courtId: string): Promise<void>; // delete all
}
