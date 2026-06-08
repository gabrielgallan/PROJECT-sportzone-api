import type { FastifyInstance } from "fastify";
import { authenticateWithCredentialsController } from "../controllers/authenticate-with-crendentias";
import { registerController } from "../controllers/register";

export function identityRoutes(app: FastifyInstance) {
	app.register(registerController);
	app.register(authenticateWithCredentialsController);
}
