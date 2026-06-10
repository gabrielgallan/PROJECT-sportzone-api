import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
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
import { notificationsRoutes } from './routes/notifications';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);

app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, {
	methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
});

await app.register(fastifyMultipart, {
	limits: {
		fileSize: 5 * 1024 * 1024, // 5mb
	},
});

app.register(fastifyJwt, {
	secret: {
		private: Buffer.from(env.JWT_PRIVATE_KEY, 'base64'),
		public: Buffer.from(env.JWT_PUBLIC_KEY, 'base64'),
	},
});

await app.register(fastifySwagger, {
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
		app.register(notificationsRoutes);
	},
	{ prefix: 'api' },
);

export { app };
