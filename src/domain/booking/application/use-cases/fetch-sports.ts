import { type Either, right } from '@/core/types/either';
import type { SportsRepository } from '../repositories/sports-repository';
import { Sport } from '../../enterprise/entities/sport';

type FetchSportsUseCaseResponse = Either<
    null,
    {
        sports: Sport[];
    }
>;

export class FetchSportsUseCase {
    constructor(
        private sportsRepository: SportsRepository,
    ) {}

    async execute(): Promise<FetchSportsUseCaseResponse> {
        const sports = await this.sportsRepository.findAll()

        return right({
            sports,
        });
    }
}
