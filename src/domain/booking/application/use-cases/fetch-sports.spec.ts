import { InMemorySportsRepository } from 'test/unit/repositories/in-memory-sports-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Sport } from '../../enterprise/entities/sport';
import { FetchSportsUseCase } from './fetch-sports';

let sportsRepository: InMemorySportsRepository;
let sut: FetchSportsUseCase;

describe('Fetch sports use case', () => {
	beforeEach(() => {
		sportsRepository = new InMemorySportsRepository();

		sportsRepository.items.push(
			Sport.create({ name: 'Soccer' }, new UniqueEntityID('soccer')),
			Sport.create({ name: 'Volley' }, new UniqueEntityID('volley')),
			Sport.create({ name: 'Football' }, new UniqueEntityID('football')),
		);

		sut = new FetchSportsUseCase(sportsRepository);
	});

	it('should not be able to edit a non-existing court', async () => {
		const result = await sut.execute();

		expect(result.isRight()).toBe(true);
		expect(result.value?.sports).toHaveLength(3);

		expect(result.value?.sports[0].slug.value).toBe('soccer');
		expect(result.value?.sports[1].slug.value).toBe('volley');
		expect(result.value?.sports[2].slug.value).toBe('football');
	});
});
