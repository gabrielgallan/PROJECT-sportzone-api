import type { FastifyInstance } from 'fastify';
import { providers as authProviders } from '@/infra/auth';
import { pluggins as cryptographyPluggins } from '@/infra/cryptography';
import { repositories } from '@/infra/database';
import { AuthenticateWithProviderUseCase } from '../authenticate-with-provider';

export function makeAuthenticateWithGithubUseCase(app: FastifyInstance) {
	const { encrypter } = cryptographyPluggins(app);

	const authenticateUseCase = new AuthenticateWithProviderUseCase(
		repositories.users,
		repositories.accounts,
		authProviders.github,
		encrypter,
	);

	return authenticateUseCase;
}
