import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { identityRoutes } from "./routes/identity";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);

app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "sportzone api",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

await app.register(ScalarApiReference, {
	routePrefix: "/reference",
	configuration: {
		theme: "elysiajs",
	},
});

await app.register(
	() => {
		app.register(identityRoutes);
	},
	{ prefix: "api" },
);

export { app };
