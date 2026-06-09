import { repositories } from '@/infra/database';
import { services } from '@/infra/email';
import { RequestPasswordRecoverUseCase } from '../request-password-recover';

export function makeRequestPasswordRecoverUseCase() {
	const requestPasswordRecoverUseCase = new RequestPasswordRecoverUseCase(
		repositories.users,
		repositories.tokens,
		services.emailSender,
	);

	return requestPasswordRecoverUseCase;
}
