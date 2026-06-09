import type { FastifyInstance } from 'fastify';
import { plugins } from '@/infra/auth';
import { acceptInviteController } from '../controllers/accept-invite';
import { authenticateWithCredentialsController } from '../controllers/authenticate-with-crendentias';
import { authenticateWithGithubController } from '../controllers/authenticate-with-github';
import { authenticateWithGoogleController } from '../controllers/authenticate-with-google';
import { createOrganizationController } from '../controllers/create-organization';
import { declineInviteController } from '../controllers/decline-invite';
import { getProfileController } from '../controllers/get-profile';
import { inviteMemberController } from '../controllers/invite-member';
import { listInvitesController } from '../controllers/list-invites';
import { listOrganizationMembersController } from '../controllers/list-organization-members';
import { listOrganizationsController } from '../controllers/list-user-organizations';
import { registerController } from '../controllers/register';
import { removeMembershipController } from '../controllers/remove-membership';
import { requestPasswordRecoverController } from '../controllers/request-password-recover';
import { resetPasswordController } from '../controllers/reset-password';
import { transferOwnershipController } from '../controllers/transfer-ownership';
import { updateMembershipRoleController } from '../controllers/update-membership-role';
import { updateOrganizationProfileController } from '../controllers/update-organization';
import { uploadAvatarController } from '../controllers/upload-avatar';
import { uploadOrgAvatarController } from '../controllers/upload-org-avatar';

export function identityRoutes(app: FastifyInstance) {
	app.register(plugins.authPlugin);

	app.register(registerController);
	app.register(requestPasswordRecoverController);
	app.register(resetPasswordController);
	app.register(authenticateWithCredentialsController);
	app.register(authenticateWithGithubController);
	app.register(authenticateWithGoogleController);
	app.register(getProfileController);
	app.register(inviteMemberController);
	app.register(listInvitesController);
	app.register(acceptInviteController);
	app.register(declineInviteController);
	app.register(createOrganizationController);
	app.register(listOrganizationsController);
	app.register(listOrganizationMembersController);
	app.register(updateMembershipRoleController);
	app.register(updateOrganizationProfileController);
	app.register(transferOwnershipController);
	app.register(removeMembershipController);
	app.register(uploadAvatarController);
	app.register(uploadOrgAvatarController);
}
