import type { PaginationInput } from '@/core/types/pagination';
import { BadRequestError } from '../errors/bad-request-error';

interface PaginationQuery {
	page?: string;
	limit?: string;
}

export function parsePaginationQuery({
	page,
	limit,
}: PaginationQuery): PaginationInput | undefined {
	if (page && limit) {
		return {
			page: Number(page),
			limit: Number(limit),
		};
	}

	if ((page && !limit) || (limit && !page)) {
		throw new BadRequestError('Invalid pagination query');
	}

	return undefined;
}
