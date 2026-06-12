import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { Court } from '../../enterprise/entities/court';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { ListOrganizationCourtsUseCase } from './list-organization-courts';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';

let courtsRepository: InMemoryCourtsRepository;
let courtImagesRepository: InMemoryCourtImagesRepository;
let imagesRepository: InMemoryImagesRepository;

let sut: ListOrganizationCourtsUseCase;

describe('List organization courts use case', () => {
	beforeEach(() => {
		courtImagesRepository = new InMemoryCourtImagesRepository();
		imagesRepository = new InMemoryImagesRepository();
		courtsRepository = new InMemoryCourtsRepository(courtImagesRepository, imagesRepository);

		sut = new ListOrganizationCourtsUseCase(courtsRepository);
	});

	it('should be able to list organization courts', async () => {
		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-1'),
				name: 'Court 1',
				coverImage: null,
				address: 'Street 1',
				latitude: -23.4567,
				longitude: -46.4567,
				pricePerHour: Cash.fromCents(3000),
				images: new CourtImagesList([]),
			}),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-1'),
				name: 'Court 2',
				coverImage: null,
				address: 'Street 2',
				latitude: -23.5567,
				longitude: -46.5567,
				pricePerHour: Cash.fromCents(4000),
				images: new CourtImagesList([]),
			}),
		);

		await courtsRepository.create(
			Court.create({
				organizationId: new UniqueEntityID('org-2'),
				name: 'Court 3',
				coverImage: null,
				address: 'Street 3',
				latitude: -23.6567,
				longitude: -46.6567,
				pricePerHour: Cash.fromCents(5000),
				images: new CourtImagesList([]),
			}),
		);

		const result = await sut.execute({
			organizationId: 'org-1',
			pagination: {
				page: 1,
				limit: 10,
			},
		});

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.courtsList.data).toHaveLength(2);
			expect(result.value.courtsList.data.map((court) => court.name)).toEqual([
				'Court 1',
				'Court 2',
			]);
			expect(result.value.courtsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});
});
