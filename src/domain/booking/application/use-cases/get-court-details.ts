import { ResourceNotFoundError } from '@/core/shared/errors/resource-not-found-error';
import { type Either, left, right } from '@/core/types/either';
import type { Court } from '../../enterprise/entities/court';
import type { CourtsRepository } from '../repositories/courts-repository';

interface GetCourtDetailsUseCaseRequest {
	courtId: string;
}

type GetCourtDetailsUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		court: Court;
	}
>;

export class GetCourtDetailsUseCase {
	constructor(private courtsRepository: CourtsRepository) {}

	async execute({
		courtId,
	}: GetCourtDetailsUseCaseRequest): Promise<GetCourtDetailsUseCaseResponse> {
		const court = await this.courtsRepository.findById(courtId);

		if (!court) {
			return left(new ResourceNotFoundError());
		}

		return right({
			court,
		});
	}
}
