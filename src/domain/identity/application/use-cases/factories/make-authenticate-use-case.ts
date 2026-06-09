import type { FastifyInstance } from 'fastify';
import {
	pluggins as cryptographyPluggins,
	services as cryptographyServices,
} from '@/infra/cryptography';
import { repositories } from '@/infra/database';
import { AuthenticateUseCase } from '../authenticate';

export function makeAuthenticateUseCase(app: FastifyInstance) {
	const { encrypter } = cryptographyPluggins(app);

	const authenticateUseCase = new AuthenticateUseCase(
		repositories.users,
		cryptographyServices.hasher,
		encrypter,
	);

	return authenticateUseCase;
}
