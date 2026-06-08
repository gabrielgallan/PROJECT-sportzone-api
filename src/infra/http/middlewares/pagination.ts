import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

interface PaginationQuery {
	page?: string
	limit?: string
}

export const paginationPlugin = fastifyPlugin(async (app: FastifyInstance) => {
    app.addHook("preHandler", async (request) => {
        request.getPaginationQuery = async () => {
            const { page, limit } = request.query as PaginationQuery

            if (page && limit) {
                return {
                    page: Number(page),
                    limit: Number(limit)
                }
            }

            return undefined
        };
    });
});
