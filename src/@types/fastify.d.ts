import 'fastify';
import type { Organization } from 'generated/prisma/client';

declare module 'fastify' {
	export interface FastifyRequest {
		getUserId(): Promise<string>;
		getOrganizationBySlug(): Promise<Organization>;
	}
}
