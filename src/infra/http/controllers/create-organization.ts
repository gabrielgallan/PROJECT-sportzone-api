import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { makeCreateOrganizationUseCase } from "@/domain/identity/application/use-cases/factories/make-create-organization-use-case";
import { OrganizationAlreadyExistsError } from "@/domain/identity/application/use-cases/errors/organization-already-exists-error";

export function createOrganizationController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/organizations",
		{
			schema: {
				summary: "Create organization",
				tags: ["org"],
				security: [{ bearerAuth: [] }],
                body: z.object({
					name: z.string(),
                    avatarUrl: z.string().nullable()
				}),
				response: {
					201: z.null(),
					404: z.object({ message: z.string() }),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

            const { name, avatarUrl } = request.body

			const createOrganization = makeCreateOrganizationUseCase();

			const result = await createOrganization.execute({
				userId,
                name,
                avatarUrl
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case ResourceNotFoundError:
						return reply.status(404).send({ message: error.message });

					case OrganizationAlreadyExistsError:
						return reply.status(409).send({ message: error.message });

					default:
						throw error;
				}
			}

			reply.status(201).send(null);
		},
	);
}
