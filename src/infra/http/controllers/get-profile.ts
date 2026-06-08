import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { InvalidCredentialsError } from "@/domain/identity/application/use-cases/errors/invalid-credentials-error";
import { makeAuthenticateUseCase } from "@/domain/identity/application/use-cases/factories/make-authenticate-use-case";

export function getProfileController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/profile",
		{
			schema: {
				summary: "Authenticate with credentials",
				tags: ["auth"],
				body: z.object({
					email: z.email(),
					password: z.string(),
				}),
				response: {
					200: z.object({ token: z.string() }),
					401: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const authenticate = makeAuthenticateUseCase();

			const result = await authenticate.execute({
				email,
				password,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case InvalidCredentialsError:
						return reply.status(401).send({ message: error.message });

					default:
						throw error;
				}
			}

			reply.status(200).send(result.value);
		},
	);
}
