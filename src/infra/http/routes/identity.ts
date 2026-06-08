import type { FastifyInstance } from "fastify";
import { registerController } from "../controllers/register";

export function identityRoutes(app: FastifyInstance) {
	app.register(registerController);
}
