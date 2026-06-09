import type { FastifyInstance } from 'fastify';
import { BcryptHasher } from './bcrypt-hasher';
import { FastifyJwtEncrypter } from './jwt-encrypter';

const services = {
	hasher: new BcryptHasher(),
};

const pluggins = (app: FastifyInstance) => {
	return {
		encrypter: new FastifyJwtEncrypter(app),
	};
};

export { pluggins, services };
