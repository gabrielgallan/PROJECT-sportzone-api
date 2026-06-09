import { services as cryptographyServices } from '@/infra/cryptography';
import { repositories } from '@/infra/database';
import { RegisterUseCase } from '../register';

export function makeRegisterUseCase() {
	const registerUseCase = new RegisterUseCase(repositories.users, cryptographyServices.hasher);

	return registerUseCase;
}
