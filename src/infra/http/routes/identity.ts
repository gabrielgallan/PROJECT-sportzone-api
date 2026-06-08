import type { FastifyInstance } from 'fastify';
import { authModule } from '@/infra/auth';
import { authenticateWithCredentialsController } from '../controllers/authenticate-with-crendentias';
import { createOrganizationController } from '../controllers/create-organization';
import { getProfileController } from '../controllers/get-profile';
import { listOrganizationsController } from '../controllers/list-user-organizations';
import { registerController } from '../controllers/register';

export function identityRoutes(app: FastifyInstance) {
	app.register(authModule);

	app.register(registerController);
	app.register(authenticateWithCredentialsController);
	app.register(getProfileController);
	app.register(createOrganizationController);
	app.register(listOrganizationsController);
}
