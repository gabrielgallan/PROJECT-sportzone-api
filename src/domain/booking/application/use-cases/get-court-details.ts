import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { CourtDetails } from '../../enterprise/entities/value-objects/court-details';
import type { CourtsRepository } from '../repositories/courts-repository';

interface GetCourtDetailsUseCaseRequest {
	courtId: string;
}

type GetCourtDetailsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		court: CourtDetails;
	}
>;

export class GetCourtDetailsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		courtId,
	}: GetCourtDetailsUseCaseRequest): Promise<GetCourtDetailsUseCaseResponse> {
		const court = await this.courtsRepository.findByIdWithDetails(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		return right({
			court,
		});
	}
}
