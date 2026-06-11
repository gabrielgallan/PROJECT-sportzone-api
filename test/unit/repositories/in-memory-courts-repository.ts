import type { PaginationInput } from '@/core/types/pagination';
import type { CourtsRepository } from '@/domain/booking/application/repositories/courts-repository';
import type { Court } from '@/domain/booking/enterprise/entities/court';

export class InMemoryCourtsRepository implements CourtsRepository {
	public items: Court[] = [];

	async create(court: Court) {
		this.items.push(court);

		return;
	}

	async findById(id: string) {
		const court = this.items.find((c) => c.id.toString() === id);

		return court ?? null;
	}

	async listByOrganizationId(organizationId: string, { page, limit }: PaginationInput) {
		const courts = this.items
			.filter((c) => c.organizationId.toString() === organizationId)
			.slice((page - 1) * limit, page * limit);

		return {
			data: courts,
			meta: {
				page,
				limit,
				total: this.items.length,
			},
		};
	}

	async save(court: Court) {
		const courtIndex = this.items.findIndex((c) => c.id.toString() === court.id.toString());

		if (courtIndex >= 0) {
			this.items[courtIndex] = court;
		}

		return;
	}
}
