import { WatchedList } from '@/core/entities/watched-list';
import type { CourtSport } from './court-sport';

export class CourtSportsList extends WatchedList<CourtSport> {
	compareItems(a: CourtSport, b: CourtSport): boolean {
		return a.sportId.equals(b.sportId);
	}
}
