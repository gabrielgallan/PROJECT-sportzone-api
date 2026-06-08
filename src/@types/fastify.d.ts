import 'fastify';
import type { PaginationInput } from '@/core/types/pagination';

declare module 'fastify' {
	export interface FastifyRequest {
		getUserId(): Promise<string>;
		getPaginationQuery(): Promise<PaginationInput | undefined>;
	}
}
