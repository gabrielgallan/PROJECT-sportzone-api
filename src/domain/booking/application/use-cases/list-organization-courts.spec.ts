import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Cash } from '@/core/shared/value-objects/cash';
import { InMemoryCourtImagesRepository } from 'test/unit/repositories/in-memory-court-images-repository';
import { InMemoryCourtsRepository } from 'test/unit/repositories/in-memory-courts-repository';
import { InMemoryImagesRepository } from 'test/unit/repositories/in-memory-images-repository';
import { Court } from '../../enterprise/entities/court';
import { CourtImage } from '../../enterprise/entities/court-image';
import { CourtImagesList } from '../../enterprise/entities/court-images-list';
import { Image } from '../../enterprise/entities/image';
import { ListOrganizationCourtsUseCase } from './list-organization-courts';

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
		await imagesRepository.create(
			Image.create(
				{
					title: 'Court 1 cover',
					url: 'https://example.com/court-1-cover.jpg',
				},
				new UniqueEntityID('image-1'),
			),
		);

		await courtsRepository.create(
			Court.create(
				{
					organizationId: new UniqueEntityID('org-1'),
					name: 'Court 1',
					description: 'Indoor court',
					coverImage: CourtImage.create({
						courtId: new UniqueEntityID('court-1'),
						imageId: new UniqueEntityID('image-1'),
					}),
					address: 'Street 1',
					latitude: -23.4567,
					longitude: -46.4567,
					pricePerHour: Cash.fromCents(3000),
					images: new CourtImagesList([]),
					rating: 4.8,
				},
				new UniqueEntityID('court-1'),
			),
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
			expect(result.value.courtsList.data[0].courtId).toBe('court-1');
			expect(result.value.courtsList.data[0].description).toBe('Indoor court');
			expect(result.value.courtsList.data[0].address).toBe('Street 1');
			expect(result.value.courtsList.data[0].pricePerHour).toBe(3000);
			expect(result.value.courtsList.data[0].rating).toBe(4.8);
			expect(result.value.courtsList.data[0].coverImage?.id.toString()).toBe('image-1');
			expect(result.value.courtsList.data[0].coverImage?.url).toBe(
				'https://example.com/court-1-cover.jpg',
			);
			expect(result.value.courtsList.meta).toEqual({
				page: 1,
				limit: 10,
				total: 2,
			});
		}
	});
});
