import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import fastify from 'fastify';
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '../env';
import { errorHandler } from './error-handler';
import { identityRoutes } from './routes/identity';
import fastifyCors from '@fastify/cors';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);

app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors)

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'sportzone api',
			version: '1.0.0',
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	transform: jsonSchemaTransform,
});

await app.register(ScalarApiReference, {
	routePrefix: '/reference',
	configuration: {
		theme: 'elysiajs',
	},
});

app.setErrorHandler(errorHandler);

await app.register(
	() => {
		app.register(identityRoutes);
	},
	{ prefix: 'api' },
);

export { app };
