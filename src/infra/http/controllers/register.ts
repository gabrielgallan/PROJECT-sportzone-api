import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UserAlreadyExistsError } from '@/domain/identity/application/use-cases/errors/user-already-exists-error';
import { makeRegisterUseCase } from '@/domain/identity/application/use-cases/factories/make-register-use-case';
import { ConflictError } from '../errors/conflict-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function registerController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/users',
		{
			schema: {
				summary: 'Register',
				tags: ['auth'],
				body: z.object({
					name: z.string(),
					email: z.string().email(),
					password: z.string().min(6),
				}),
				response: {
					201: z.null(),
					409: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const registerUseCase = makeRegisterUseCase();

			const result = await registerUseCase.execute({
				name,
				email,
				password,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case UserAlreadyExistsError:
						throw new ConflictError(error.message);

					default:
						throw error;
				}
			}

			reply.status(201).send(null);
		},
	);
}
