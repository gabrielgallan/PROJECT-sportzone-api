import 'fastify';

declare module 'fastify' {
	export interface FastifyRequest {
		getUserId(): Promise<string>;
	}
}
