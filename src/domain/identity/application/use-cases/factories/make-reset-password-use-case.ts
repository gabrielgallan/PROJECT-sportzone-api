import { services as cryptographyServices } from '@/infra/cryptography';
import { repositories } from '@/infra/database';
import { ResetPasswordUseCase } from '../reset-password';

export function makeResetPasswordUseCase() {
	const resetPasswordUseCase = new ResetPasswordUseCase(
		repositories.users,
		repositories.tokens,
		cryptographyServices.hasher,
	);

	return resetPasswordUseCase;
}
