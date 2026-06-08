import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserAlreadyExistsError } from "@/domain/booking/application/use-cases/errors/user-already-exists";
import { makeRegisterUseCase } from "@/domain/booking/application/use-cases/factories/make-register-use-case";

export function registerController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/users",
		{
			schema: {
				summary: "Register",
				tags: ["auth"],
				body: z.object({
					name: z.string(),
					email: z.string().email(),
					password: z.string().min(6),
				}),
				response: {
					201: z.null(),
					409: z.object({ message: z.string() }),
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
						return reply.status(409).send({ message: error.message });

					default:
						throw error;
				}
			}

			reply.status(201).send(null);
		},
	);
}
