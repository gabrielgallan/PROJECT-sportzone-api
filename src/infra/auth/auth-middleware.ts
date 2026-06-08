import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook("preHandler", async (request, reply) => {
		request.getUserId = async () => {
			try {
				const { sub } = await request.jwtVerify<{ sub: string }>();

				return sub;
			} catch {
				reply.status(401).send({ message: "Invalid auth token" });
			}
		};
	});
});
