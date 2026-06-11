import { WatchedList } from '@/core/entities/watched-list';
import type { CourtImage } from './court-image';

export class CourtImagesList extends WatchedList<CourtImage> {
	compareItems(a: CourtImage, b: CourtImage): boolean {
		return a.imageId.equals(b.imageId);
	}
}
