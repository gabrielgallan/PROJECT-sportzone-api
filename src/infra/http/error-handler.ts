import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { BadGatewayError } from './errors/bad-gateway-error';
import { BadRequestError } from './errors/bad-request-error';
import { ConflictError } from './errors/conflict-error';
import { ForbiddenError } from './errors/forbidden-error';
import { NotFoundError } from './errors/not-found-error';
import { UnauthorizedError } from './errors/unauthorized-error';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, _request, reply) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: 'Data validation error',
			errors: error.format(),
		});
	}

	if (error instanceof BadRequestError) {
		return reply.status(400).send({
			message: error.message,
		});
	}

	if (error instanceof UnauthorizedError) {
		return reply.status(401).send({
			message: error.message,
		});
	}

	if (error instanceof ForbiddenError) {
		return reply.status(403).send({
			message: error.message,
		});
	}

	if (error instanceof ConflictError) {
		return reply.status(409).send({
			message: error.message,
		});
	}

	if (error instanceof NotFoundError) {
		return reply.status(404).send({
			message: error.message,
		});
	}

	if (error instanceof BadGatewayError) {
		return reply.status(502).send({
			message: error.message,
		});
	}

	console.error(error);

	// send error to some observability platform

	return reply.status(500).send({ message: 'Internal server error' });
};
