import type { FastifyInstance } from "fastify";
import { authenticateWithCredentialsController } from "../controllers/authenticate-with-crendentias";
import { registerController } from "../controllers/register";
import { getProfileController } from "../controllers/get-profile";
import { authModule } from "@/infra/auth";
import { createOrganizationController } from "../controllers/create-organization";

export function identityRoutes(app: FastifyInstance) {
	app.register(authModule)

	app.register(registerController);
	app.register(authenticateWithCredentialsController);
	app.register(getProfileController);
	app.register(createOrganizationController);
}
